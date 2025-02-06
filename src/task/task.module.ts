import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_secret_key', // Use a secure secret
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService, PrismaService],
})
export class TaskModule {}
