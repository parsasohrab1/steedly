import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { ContributableEntityType, User } from '@asbaan/shared';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ContributionsService } from './contributions.service';

@Controller('v1/contributions')
export class ContributionsController {
  constructor(private readonly contributions: ContributionsService) {}

  @Post()
  @UseGuards(AuthGuard)
  submit(
    @CurrentUser() user: User,
    @Body() body: { entityType: ContributableEntityType; entityId: string; field: string; proposedValue: unknown; note?: string },
  ) {
    return this.contributions.submit({
      entityType: body.entityType,
      entityId: body.entityId,
      contributorUserId: user.id,
      field: body.field,
      proposedValue: JSON.stringify(body.proposedValue),
      note: body.note,
    });
  }

  @Get()
  list(@Query('entityType') entityType?: ContributableEntityType, @Query('entityId') entityId?: string) {
    return this.contributions.list(entityType, entityId);
  }

  /** Reviewed by a club_manager in the real app; the guard only checks the reviewer is
   * logged in here — role-based authorization is a documented next step, not built yet. */
  @Patch(':id/review')
  @UseGuards(AuthGuard)
  review(@CurrentUser() user: User, @Param('id') id: string, @Body('decision') decision: 'approved' | 'rejected') {
    return this.contributions.review(id, user.id, decision);
  }
}
