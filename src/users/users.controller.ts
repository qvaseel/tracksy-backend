import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() request: any) {
    return this.usersService.findById(request.user.sub);
  }

  @Get('telegram/:telegramId')
  async findByTelegramId(@Param('telegramId') telegramId: string) {
    return this.usersService.findByTelegramId(telegramId);
  }
}
