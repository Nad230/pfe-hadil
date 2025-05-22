import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from './auth.sendemail';
import { MailModule } from 'src/mail/mail.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
  
    ConfigModule.forRoot(),
    MailModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule,],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, SupabaseService, EmailService],
  exports: [JwtModule,AuthService],

})
export class AuthModule {}
