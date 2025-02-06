import { Injectable, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';




@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  async register(data: { email: string; password: string; fullname: string; phone?: string; role?: string }) {
    const supabase = this.supabaseService.getClient();

    // Step 1: Register in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: false,
      
    });

    if (authError) {
      throw new ConflictException(`Supabase Auth Error: ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new InternalServerErrorException('Failed to retrieve user ID from Supabase.');
    }

    // Step 2: Store additional details in our database
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        id_users: userId,
        email: data.email,
        password: hashedPassword,
        fullname: data.fullname,
        phone: data.phone || null,
        role: data.role || 'user',
      },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ConflictException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async getprofile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // Ensure this matches your DB field
      select: {
        id: true,
        email: true,
        fullname: true,
        phone: true,
        role: true,
        profile_photo:true,
      },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }
  async updateProfile(userId: string, data: UpdateProfileDto) {
    // Check if the user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // If email is being updated, check for duplicates
    if (data.email && data.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
  
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }
  
    // Update the user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullname: data.fullname || user.fullname,
        email: data.email || user.email,
        phone: data.phone || user.phone,
        profile_photo: data.profile_photo || user.profile_photo
      },
    });
  
    return updatedUser;
  }


  async updatePassword(userId: string, data: UpdatePasswordDto) {
    // Step 1: Find the user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
  
    // Step 2: Compare the current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect current password');
    }
  
    // Step 3: Hash the new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  
    // Step 4: Update the password in the database
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update password');
    }
  }
  
}
