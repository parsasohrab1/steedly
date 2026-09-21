import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HorsesModule } from './horses/horses.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FeedbackModule } from './feedback/feedback.module';
import { RiskModule } from './risk/risk.module';
import { TechniqueModule } from './technique/technique.module';
import { BodyConditionModule } from './body-condition/body-condition.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { ContributionsModule } from './contributions/contributions.module';
import { WikiModule } from './wiki/wiki.module';
import { BreedsModule } from './breeds/breeds.module';
import { StallionsModule } from './stallions/stallions.module';

@Module({
  imports: [
    AuthModule,
    HorsesModule,
    BookingsModule,
    ReviewsModule,
    FeedbackModule,
    RiskModule,
    TechniqueModule,
    BodyConditionModule,
    PaymentsModule,
    LoyaltyModule,
    ContributionsModule,
    WikiModule,
    BreedsModule,
    StallionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
