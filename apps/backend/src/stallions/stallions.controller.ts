import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { CreateStallionListingInput, User } from '@asbaan/shared';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { StallionsService } from './stallions.service';

@Controller('v1/stallions')
export class StallionsController {
  constructor(private readonly stallions: StallionsService) {}

  @Get()
  findAll() {
    return this.stallions.findAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: Omit<CreateStallionListingInput, 'ownerUserId' | 'ownerDisplayName'>) {
    return this.stallions.create({ ...body, ownerUserId: user.id, ownerDisplayName: user.name });
  }
}
