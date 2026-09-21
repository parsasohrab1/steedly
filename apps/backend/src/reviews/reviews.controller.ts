import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review, ReviewCategory } from '@asbaan/shared';

@Controller('v1/reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  findAll(@Query('category') category?: ReviewCategory) {
    return this.reviews.findAll(category);
  }

  @Post()
  create(@Body() body: Omit<Review, 'id' | 'createdAtIso'>) {
    return this.reviews.create(body);
  }
}
