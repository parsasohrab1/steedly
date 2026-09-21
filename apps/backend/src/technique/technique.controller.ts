import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TechniqueService } from './technique.service';
import {
  getReferencesByCategory,
  ReferenceCategory,
  TECHNIQUE_CRITERIA,
  TECHNIQUE_REFERENCE_LIBRARY,
  VideoSubmission,
} from '@asbaan/shared';

@Controller('v1/technique')
export class TechniqueController {
  constructor(private readonly technique: TechniqueService) {}

  @Get('criteria')
  criteria() {
    return TECHNIQUE_CRITERIA;
  }

  @Get('references')
  references(@Query('category') category?: ReferenceCategory) {
    return category ? getReferencesByCategory(category) : TECHNIQUE_REFERENCE_LIBRARY;
  }

  @Post('videos')
  submit(@Body() body: Pick<VideoSubmission, 'riderId' | 'horseId' | 'discipline' | 'videoUrl'>) {
    return this.technique.submit(body);
  }

  @Post('videos/:id/analyze')
  analyze(@Param('id') id: string) {
    return this.technique.analyze(id);
  }

  @Get('videos/:id')
  getResult(@Param('id') id: string) {
    return this.technique.getResult(id);
  }
}
