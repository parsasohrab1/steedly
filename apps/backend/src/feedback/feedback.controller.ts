import { Body, Controller, Get, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackMessage } from '@asbaan/shared';

@Controller('v1/feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Get()
  findAll() {
    return this.feedback.findAll();
  }

  @Post()
  create(@Body() body: Omit<FeedbackMessage, 'id' | 'createdAtIso'>) {
    return this.feedback.create(body);
  }
}
