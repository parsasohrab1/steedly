import { Controller, Get, Param } from '@nestjs/common';
import { RiskService } from './risk.service';

@Controller('v1/horses/:id/risk-status')
export class RiskController {
  constructor(private readonly risk: RiskService) {}

  @Get()
  getStatus(@Param('id') id: string) {
    return this.risk.getLatest(id);
  }
}
