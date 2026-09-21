import { Module } from '@nestjs/common';
import { BreedsController } from './breeds.controller';

@Module({
  controllers: [BreedsController],
})
export class BreedsModule {}
