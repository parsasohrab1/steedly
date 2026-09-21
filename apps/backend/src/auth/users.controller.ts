import { Controller, Get, Param, Query } from '@nestjs/common';
import type { UserRole } from '@asbaan/shared';
import { AuthService } from './auth.service';

@Controller('v1/users')
export class UsersController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  findAll(@Query('role') role?: UserRole) {
    const users = this.auth.findAll();
    return role ? users.filter((u) => u.roles.includes(role)) : users;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auth.findById(id);
  }
}
