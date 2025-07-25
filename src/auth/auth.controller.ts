import { Body, Controller, Delete, Get, Param, Put, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req ) {
    return req.user
  }

  @Get('get-users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Put('update-verification/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateVerification(@Param('id') userId: string) {
    return this.authService.toggleUserVerification(userId);
  }

}
