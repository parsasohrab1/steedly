import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { User } from '@asbaan/shared';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { LoyaltyService } from './loyalty.service';

@Controller('v1/loyalty')
export class LoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get('rewards')
  rewards() {
    return this.loyalty.listRewards();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return {
      account: this.loyalty.getAccount(user.id),
      redemptions: this.loyalty.listRedemptions(user.id),
    };
  }

  @Post('redeem')
  @UseGuards(AuthGuard)
  redeem(@CurrentUser() user: User, @Body('rewardId') rewardId: string) {
    return this.loyalty.redeem(user.id, rewardId);
  }
}
