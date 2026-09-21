export interface LoyaltyReward {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
}

export const POINTS_PER_APPROVED_CONTRIBUTION = 10;

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'reward-feed-2kg',
    title: 'بسته ۲ کیلویی کنسانتره طعم‌دار',
    pointsCost: 100,
    description: 'یک بسته ۲ کیلویی کنسانتره طعم‌دار برای اسب — ارسال به آدرس باشگاه یا منزل.',
  },
  {
    id: 'reward-farrier-discount',
    title: 'تخفیف ۲۰٪ نعل‌بندی بعدی',
    pointsCost: 60,
    description: 'کد تخفیف ۲۰٪ برای رزرو بعدی نعلبند از طریق اسبان.',
  },
  {
    id: 'reward-vet-checkup',
    title: 'یک ویزیت رایگان چکاپ عمومی دامپزشک',
    pointsCost: 250,
    description: 'یک نوبت ویزیت چکاپ عمومی رایگان با یکی از دامپزشکان طرف‌قرارداد اسبان.',
  },
];

export type RedemptionStatus = 'requested' | 'shipped' | 'delivered' | 'canceled';

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: RedemptionStatus;
  requestedAtIso: string;
}

export interface LoyaltyAccount {
  userId: string;
  points: number;
  updatedAtIso: string;
}
