import { Body, Controller,Patch, Post, UseGuards, Request, Get, BadRequestException, InternalServerErrorException, Param, Query, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';  // Import SupabaseService
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateAssistantProfileDto } from './dto/create-assistant-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
export class AuthController {
    supabase: any;
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService ,
        private readonly prisma: PrismaService,
 // Inject SupabaseService here
  ) {}

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(@Request() req) {
      console.log(req.user);
    const userId = req.user.sub;
    return this.authService.getUserNotifications(userId);
  }
   @UseGuards(JwtAuthGuard)
  @Get('unread/count')
  async countUnreadNotifications(@Request() req) {
      console.log(req.user);
    const userId = req.user.sub;
    return this.authService.countUnreadNotifications(userId);
  }

  // ✅ Mark one notification as read
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.authService.markAsRead(id);
  }

  // ✅ Mark all notifications as read
  @UseGuards(JwtAuthGuard)
  @Put('mark-all-read')
  async markAllAsRead(@Request() req) {
    const userId = req.user.sub;
    return this.authService.markAllAsRead(userId);
  }
  @Get('all')
  @UseGuards(JwtAuthGuard)
  getall(@Request() req) {
    return this.authService.getAllUsers(req.user.sub); // The logged-in user's data
  }
 @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmailToken(token);
  }
  @Get('wasActive')
  @UseGuards(JwtAuthGuard)
  getActive(@Request() req) {
    return this.authService.wasUserActiveToday(req.user.sub); // The logged-in user's data
  }

  @Get('lastTimeActive')
  @UseGuards(JwtAuthGuard)
  getlastTimeActive(@Request() req) {
    return this.authService.getTimeSinceLastLogin(req.user.sub); // The logged-in user's data
  }

  @Get('stats')
  async getstats() {
    return this.authService.getUserStats();
  }

  @Get('statsPackage')
  async getstatsPackage() {
    return this.authService.getUsersByPackageType();
  }
  @Get('search')
  async searchByName(@Query('name') name: string) {
    return this.authService.getProfileByName(name);
  }
  @Post('register')
  async register(@Body() body: { email: string; password: string; fullname: string;profile_photo:string }) {
    return this.authService.register(body);
  }
  
    @UseGuards(JwtAuthGuard)
  @Post('save-Information-Freelance')
  async saveInfo(
    @Request() req,
    @Body() dto: CreateAssistantProfileDto
  ) {
    const userId = req.user.sub
    return this.authService.createFreelanceProfile(userId, dto)
  }
  
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
  

  @Get('me-Freelance')
  @UseGuards(JwtAuthGuard)
  getProfileFreelance(@Request() req) {
    return this.authService.getFreelanceProfile(req.user.sub); // The logged-in user's data
  }
  @Get('mesage-withai')
  @UseGuards(JwtAuthGuard)
  getmesage(@Request() req) {
    return this.authService.getRecentMessages(req.user.sub); // The logged-in user's data
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user; // The logged-in user's data
  }

  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return this.authService.getprofile(userId);
  }
 
  

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(@Request() req) {
    return this.authService.getAllUsers(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('typeproject')
  async getProjctType(@Request() req) {
    return this.authService.getTypeBusinessByUser(req.user.sub);
  }

  @Patch('update')
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
