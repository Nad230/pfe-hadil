import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [AuthModule, PrismaModule, SupabaseModule, ProjectModule],
})
export class AppModule {}
