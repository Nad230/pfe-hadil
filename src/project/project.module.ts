import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_secret_key', // Use a secure secret
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService],
})
export class ProjectModule {}
