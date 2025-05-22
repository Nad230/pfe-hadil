import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { TeamController } from './team.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [AuthModule,PrismaModule], 
  providers: [TeamService],
  controllers: [TeamController]
})
export class TeamModule {}


