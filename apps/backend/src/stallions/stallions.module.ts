import { Module } from '@nestjs/common';
import { StallionsController } from './stallions.controller';
import { StallionsService } from './stallions.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StallionsController],
  providers: [StallionsService],
})
export class StallionsModule {}
