import { Module } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { MilestoneController } from './milestone.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [AuthModule,PrismaModule], 
  providers: [MilestoneService],
  controllers: [MilestoneController]
})
export class MilestoneModule {}
