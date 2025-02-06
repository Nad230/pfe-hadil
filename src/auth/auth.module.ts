import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_secret_key', // Replace with a secure key (use environment variables)
      signOptions: { expiresIn: '1h' }, // Token expires in 1 hour
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, PrismaService, SupabaseService],
  exports: [JwtModule],
})
export class AuthModule {}
