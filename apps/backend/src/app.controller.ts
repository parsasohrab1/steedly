import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  health() {
    return { service: 'asbaan-backend', status: 'ok', time: new Date().toISOString() };
  }
}
