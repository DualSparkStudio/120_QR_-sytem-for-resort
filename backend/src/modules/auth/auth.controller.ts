import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('staff/login')
  @UseGuards(LocalAuthGuard)
  async staffLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('guest/session')
  async createGuestSession(@Body() body: { roomId: string }) {
    if (!body.roomId) {
      throw new BadRequestException('roomId is required');
    }
    return this.authService.createGuestSession(body.roomId);
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }
    return this.authService.refreshToken(body.refreshToken);
  }
}
