import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [BookingsModule],
  controllers: [TelemetryController, RiskController],
  providers: [RiskService],
})
export class RiskModule {}
