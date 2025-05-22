import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  Get,
  Param,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ✅ Create/send a new notification to a user
  @UseGuards(JwtAuthGuard)
  @Post(':userId')
  async sendToUser(
    @Param('userId') userId: string,
    @Body() data: { title: string; message: string },
  ) {
    return this.notificationService.sendToUser(userId, data);
  }

 


  // ✅ Get count of unread notifications
 
}
