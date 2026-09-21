import { Injectable } from '@nestjs/common';
import { FeedbackMessage } from '@asbaan/shared';
import { randomUUID } from 'crypto';

@Injectable()
export class FeedbackService {
  private messages: FeedbackMessage[] = [];

  findAll(): FeedbackMessage[] {
    return this.messages;
  }

  create(input: Omit<FeedbackMessage, 'id' | 'createdAtIso'>): FeedbackMessage {
    const message: FeedbackMessage = { id: randomUUID(), createdAtIso: new Date().toISOString(), ...input };
    this.messages.unshift(message);
    return message;
  }
}
