import { Body, Controller,Patch, Post, UseGuards, Request, Get, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';  // Import SupabaseService
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
    supabase: any;
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService  // Inject SupabaseService here
  ) {}



  @Post('register')
  async register(@Body() body: { email: string; password: string; fullname: string }) {
    return this.authService.register(body);
  }
  

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
  

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user; // The logged-in user's data
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getprofile(@Request() req) {
    return this.authService.getprofile(req.user.sub); // Extract user ID from JWT payload
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
   return this.authService.updateProfile(req.user.sub, body);
   }

   @Patch('password')
   @UseGuards(JwtAuthGuard)
   async updatePassword(@Request() req, @Body() body: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.sub, body);
   }
}
