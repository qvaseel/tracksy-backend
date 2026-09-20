import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { validate, parse } from '@tma.js/init-data-node';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async loginWithTelegram(initData: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }

    try {
      validate(initData, botToken);
    } catch {
      throw new UnauthorizedException('Invalid Telegram initData');
    }

    const data = parse(initData);

    const telegramUser = data.user;

    if (!telegramUser) {
      throw new UnauthorizedException('Telegram user data not found');
    }

    const telegramId = String(telegramUser.id);

    let user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      user = await this.usersService.create({
        telegramId,
        username:
          typeof telegramUser.username === 'string'
            ? telegramUser.username
            : undefined,

        firstName:
          typeof telegramUser.firstName === 'string'
            ? telegramUser.firstName
            : undefined,

        lastName:
          typeof telegramUser.lastName === 'string'
            ? telegramUser.lastName
            : undefined,
      });
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId,
    });

    return {
      accessToken,
      user,
    };
  }
}
