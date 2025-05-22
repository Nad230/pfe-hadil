import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { AIService } from 'src/ai/ai.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [AuthModule,PrismaModule], 
  controllers: [ProjectController],
 
  providers: [ProjectService],
})
export class ProjectModule {}
