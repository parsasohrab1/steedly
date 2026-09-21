import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from '@asbaan/shared';

@Controller('v1/bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  findAll(@Query('horseId') horseId?: string) {
    return this.bookings.findAll(horseId);
  }

  @Post()
  create(@Body() body: Omit<Booking, 'id' | 'status'>) {
    return this.bookings.create(body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: Booking['status']) {
    return this.bookings.updateStatus(id, status);
  }
}
