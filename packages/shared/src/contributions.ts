/**
 * Generic community-contribution system: any registered user can propose a fact
 * about a horse (pedigree, ownership history) OR about another member's profile
 * (bio, credentials, contact info), a club_manager/admin reviews it, and an
 * approved contribution both updates the record and awards the contributor
 * loyalty points (see loyalty.ts). One mechanism covers both entity types rather
 * than duplicating a parallel review/points flow per entity.
 */

export type ContributableEntityType = 'horse' | 'user';

/** Editable-field keys a contribution can target on a member profile — used as
 * `field` on a Contribution whose entityType is 'user'. Horse-side field keys
 * live in horse-history.ts's HorseHistoryField. */
export type UserProfileField = 'bio' | 'credentialUrl' | 'phone';

export type ContributionStatus = 'pending' | 'approved' | 'rejected';

export interface Contribution {
  id: string;
  entityType: ContributableEntityType;
  entityId: string;
  contributorUserId: string;
  /** A HorseHistoryField when entityType is 'horse', a UserProfileField when it's 'user'. */
  field: string;
  /** JSON-serialized proposed value — shape depends on entityType + field (a
   * HorsePedigree, an OwnershipRecord, or a plain string for user profile fields). */
  proposedValue: string;
  note?: string;
  status: ContributionStatus;
  submittedAtIso: string;
  reviewedAtIso?: string;
  reviewedByUserId?: string;
  pointsAwarded?: number;
}
