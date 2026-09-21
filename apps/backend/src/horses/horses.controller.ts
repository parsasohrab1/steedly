import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HorsesService } from './horses.service';
import { Horse } from '@asbaan/shared';

@Controller('v1/horses')
export class HorsesController {
  constructor(private readonly horses: HorsesService) {}

  @Get()
  findAll(@Query('ownerId') ownerId?: string) {
    return this.horses.findAll(ownerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.horses.findOne(id);
  }

  @Post()
  create(@Body() body: Omit<Horse, 'id'>) {
    return this.horses.create(body);
  }
}
