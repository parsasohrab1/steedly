import { Module } from '@nestjs/common';
import { TechniqueController } from './technique.controller';
import { TechniqueService } from './technique.service';

@Module({
  controllers: [TechniqueController],
  providers: [TechniqueService],
})
export class TechniqueModule {}
