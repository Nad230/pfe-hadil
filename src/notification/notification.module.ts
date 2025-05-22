import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [NotificationService],
  controllers: [NotificationController],
  imports:[PrismaModule,JwtModule]
})
export class NotificationModule {}
