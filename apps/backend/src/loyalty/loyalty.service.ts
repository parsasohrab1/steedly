import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LOYALTY_REWARDS, LoyaltyAccount, RewardRedemption } from '@asbaan/shared';

@Injectable()
export class LoyaltyService {
  private accounts = new Map<string, LoyaltyAccount>();
  private redemptions: RewardRedemption[] = [];

  private getOrCreateAccount(userId: string): LoyaltyAccount {
    let account = this.accounts.get(userId);
    if (!account) {
      account = { userId, points: 0, updatedAtIso: new Date().toISOString() };
      this.accounts.set(userId, account);
    }
    return account;
  }

  getAccount(userId: string): LoyaltyAccount {
    return this.getOrCreateAccount(userId);
  }

  awardPoints(userId: string, points: number): LoyaltyAccount {
    const account = this.getOrCreateAccount(userId);
    account.points += points;
    account.updatedAtIso = new Date().toISOString();
    return account;
  }

  listRewards() {
    return LOYALTY_REWARDS;
  }

  redeem(userId: string, rewardId: string): RewardRedemption {
    const reward = LOYALTY_REWARDS.find((r) => r.id === rewardId);
    if (!reward) throw new NotFoundException(`Reward ${rewardId} not found`);

    const account = this.getOrCreateAccount(userId);
    if (account.points < reward.pointsCost) {
      throw new BadRequestException(
        `امتیاز کافی نیست: ${account.points} امتیاز دارید، ${reward.pointsCost} امتیاز لازم است`,
      );
    }

    account.points -= reward.pointsCost;
    account.updatedAtIso = new Date().toISOString();

    const redemption: RewardRedemption = {
      id: randomUUID(),
      userId,
      rewardId,
      pointsSpent: reward.pointsCost,
      status: 'requested',
      requestedAtIso: new Date().toISOString(),
    };
    this.redemptions.push(redemption);
    return redemption;
  }

  listRedemptions(userId: string): RewardRedemption[] {
    return this.redemptions.filter((r) => r.userId === userId);
  }
}
