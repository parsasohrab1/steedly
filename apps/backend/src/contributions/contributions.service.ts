import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Contribution,
  ContributableEntityType,
  HorsePedigree,
  OwnershipRecord,
  POINTS_PER_APPROVED_CONTRIBUTION,
} from '@asbaan/shared';
import { HorsesService } from '../horses/horses.service';
import { AuthService } from '../auth/auth.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

interface SubmitContributionInput {
  entityType: ContributableEntityType;
  entityId: string;
  contributorUserId: string;
  field: string;
  proposedValue: string;
  note?: string;
}

@Injectable()
export class ContributionsService {
  private contributions: Contribution[] = [];

  constructor(
    private readonly horses: HorsesService,
    private readonly auth: AuthService,
    private readonly loyalty: LoyaltyService,
  ) {}

  submit(input: SubmitContributionInput): Contribution {
    const contribution: Contribution = {
      id: randomUUID(),
      status: 'pending',
      submittedAtIso: new Date().toISOString(),
      ...input,
    };
    this.contributions.push(contribution);
    return contribution;
  }

  list(entityType?: ContributableEntityType, entityId?: string): Contribution[] {
    return this.contributions.filter(
      (c) => (!entityType || c.entityType === entityType) && (!entityId || c.entityId === entityId),
    );
  }

  /** club_manager/admin action: apply the proposed value to the target entity and award points. */
  review(id: string, reviewerUserId: string, decision: 'approved' | 'rejected'): Contribution {
    const contribution = this.contributions.find((c) => c.id === id);
    if (!contribution) throw new NotFoundException(`Contribution ${id} not found`);
    if (contribution.status !== 'pending') {
      throw new BadRequestException(`Contribution ${id} was already reviewed`);
    }

    contribution.status = decision;
    contribution.reviewedAtIso = new Date().toISOString();
    contribution.reviewedByUserId = reviewerUserId;

    if (decision === 'approved') {
      this.applyToEntity(contribution);
      contribution.pointsAwarded = POINTS_PER_APPROVED_CONTRIBUTION;
      this.loyalty.awardPoints(contribution.contributorUserId, POINTS_PER_APPROVED_CONTRIBUTION);
    }

    return contribution;
  }

  private applyToEntity(contribution: Contribution): void {
    const value = JSON.parse(contribution.proposedValue);

    if (contribution.entityType === 'horse') {
      if (contribution.field === 'pedigree') {
        this.horses.setPedigree(contribution.entityId, value as HorsePedigree);
      } else if (contribution.field === 'ownershipRecord') {
        this.horses.addOwnershipRecord(contribution.entityId, value as OwnershipRecord);
      }
      return;
    }

    // entityType === 'user'
    this.auth.applyProfileField(contribution.entityId, contribution.field as 'bio' | 'credentialUrl' | 'phone', value);
  }
}
