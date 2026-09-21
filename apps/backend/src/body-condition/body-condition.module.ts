import { Module } from '@nestjs/common';
import { BodyConditionController } from './body-condition.controller';

@Module({
  controllers: [BodyConditionController],
})
export class BodyConditionModule {}
