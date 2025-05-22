import { Injectable, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Role } from '@prisma/client';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { EmailService } from './auth.sendemail';
import { startOfToday, endOfToday } from 'date-fns';
import { startOfMonth, endOfMonth } from 'date-fns';
import { startOfWeek, endOfWeek } from 'date-fns';
import { PackageType } from '@prisma/client';
import * as crypto from 'crypto';

import { differenceInMinutes, differenceInHours, differenceInDays, formatDistanceToNow, isToday } from 'date-fns';
import { CreateAssistantProfileDto } from './dto/create-assistant-profile.dto';
import { MailService } from 'src/mail/mail.service';


type CreateUserAssistantProfileInput = {
  userId: string
  isNewFreelancer?: boolean
  hasExistingWork?: boolean
  hasTeam?: boolean
  hasTime?: boolean
  interestedInJob?: boolean
  skills?: string[]
  mainGoal?: string
  currentStep?: string
  plan?: string[]
  aiNotes?: string
  memory?: string[]
}
const verificationToken = crypto.randomBytes(32).toString('hex');

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
     private readonly mailService: MailService,
  ) {}



  
  // assistant.service.ts

async createMessage(userId: string, role: 'USER' | 'ASSISTANT', content: string) {
  return this.prisma.assistantMessage.create({
    data: {
      userId,
      role,
      content,
    },
  });
}

async getRecentMessages(userId: string) {
  return this.prisma.assistantMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}


  async getTimeSinceLastLogin(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastLogin: true },
    });
  
    if (!user || !user.lastLogin) {
      return 'Never logged in';
    }
  
    return formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true });
  }
  async wasUserActiveToday(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastLogin: true },
    });
  
    if (!user || !user.lastLogin) return false;
  
    return isToday(new Date(user.lastLogin));
  }
  

  async getUsersActiveToday(): Promise<number> {
    const count = await this.prisma.user.count({
      where: {
        lastLogin: {
          gte: startOfToday(),
          lte: endOfToday(),
        },
      },
    });
  
    return count;
  }

  async getUsersActiveThisMonth(): Promise<number> {
    const count = await this.prisma.user.count({
      where: {
        lastLogin: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      },
    });
  
    return count;
  }
  
  async getTotalUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async getNewUsersThisWeek(): Promise<number> {
    return this.prisma.user.count({
      where: {
        created_at: {
          gte: startOfWeek(new Date(), { weekStartsOn: 1 }), 
          lte: endOfWeek(new Date(), { weekStartsOn: 1 }),
        },
      },
    });
  }
  async getUserStats() {
    // 1. Launch all 7 queries in parallel
    const results = await Promise.allSettled([
      this.getTotalUsers(),                                        // 0
      this.getNewUsersThisWeek(),                                  // 1
      this.getUsersActiveToday(),                                  // 2
      this.getUsersActiveThisMonth(),                              // 3
      this.prisma.user.count({ where: { packageType: PackageType.SILVER } }),  // 4
      this.prisma.user.count({ where: { packageType: PackageType.GOLD } }),    // 5
      this.prisma.user.count({ where: { packageType: PackageType.DIAMOND } })  // 6
    ]);
  
    // 2. Extract each value, defaulting to 0 on failure
    const [
      totalUsers,
      newUsersThisWeek,
      activeToday,
      activeThisMonth,
      silverCount,
      goldCount,
      diamondCount,
    ] = results.map((r) => (r.status === 'fulfilled' ? r.value : 0));
  
    // 3. Return a single combined stats object
    return {
      totalUsers,
      newUsersThisWeek,
      activeToday,
      activeThisMonth,
      SILVER: silverCount,
      GOLD: goldCount,
      DIAMOND: diamondCount,
    };
  }


  
  async getUsersByPackageType() {
    const users = await this.prisma.user.findMany({
      select: { id: true, packageType: true },
    });
    console.log('All users:', users);
    const results = await Promise.allSettled([
      this.prisma.user.count({ where: { packageType: PackageType.SILVER } }),
      this.prisma.user.count({ where: { packageType: PackageType.GOLD } }),
      this.prisma.user.count({ where: { packageType: PackageType.DIAMOND } }),
    ]);
  
    const [silverResult, goldResult, diamondResult] = results;
  
    return {
      SILVER: silverResult.status === 'fulfilled' ? silverResult.value : 0,
      GOLD: goldResult.status === 'fulfilled' ? goldResult.value : 0,
      DIAMOND: diamondResult.status === 'fulfilled' ? diamondResult.value : 0,
    };
  }
  
  
  
async register(data: { email: string; password: string; fullname: string; profile_photo: string; role?: any }) {
  const supabase = this.supabaseService.getClient();

  // 1) Create in Supabase
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: false,
  });
  if (authError) throw new ConflictException(authError.message);

  const supabaseId = authData.user?.id!;
  
  // 2) Hash & save user in your DB with emailVerified: false
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await this.prisma.user.create({
    data: {
      id_users: supabaseId,
      email: data.email,
      password: hashed,
      fullname: data.fullname,
      profile_photo: data.profile_photo,
      role: data.role || Role.USER,
      emailVerified: false,           // start unverified!
    },
  });

  // 3) Generate a one-time token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // 4) Persist token, using the correct PK field (id_users)
  await this.prisma.emailVerificationToken.create({
    data: {
      token: verificationToken,
      userId: user.id_users,           // ← use id_users
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  // 5) Email the user with the verification link
  const verifyUrl = `http://localhost:3000/auth/verify-email?token=${verificationToken}`;
  await this.mailService.sendMail(
    data.email,
    'Please verify your IndieTracker email',
    `Hi ${data.fullname},\n\nClick here to verify your account:\n\n${verifyUrl}`
  );

  return user;
}
   async verifyEmailToken(token: string) {
    // 1) find the token record
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!record) {
      throw new BadRequestException('Invalid verification token');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    // 2) mark the user as verified
    await this.prisma.user.update({
      where: { id_users: record.userId },
      data: { emailVerified: true },
    });

    // 3) delete the token so it cannot be reused
    await this.prisma.emailVerificationToken.delete({ where: { token } });

    return { message: 'Your email has been verified!' };
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
  
    // ✅ Update lastLogin field here
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
  
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
  

async getUserNotifications(userId: string, page = 1, pageSize = 10) {
  console.log('🔔 Fetching notifications for user:', userId);
  console.log('Page:', page, 'PageSize:', pageSize);

  const notifications = await this.prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  console.log('Found notifications:', notifications.length);
  return notifications;
}
 async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }



async countUnreadNotifications(userId: string) {
  return this.prisma.notification.count({
    where: { userId, isRead: false },
  });
}
async markAllAsRead(userId: string) {
  return this.prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}


  async getprofile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // Ensure this matches your DB field
      select: {
        id: true,
        email: true,
        fullname: true,
        role: true,
        location:true,
        startHour:true,
        endHour:true,
        BudgetRange:true,
        profile_photo:true,
        projectType:true,
        packageType:true,
        lastLogin :true,
        firstTime:true
      },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }

  async getProfileByName(name: string) {
    const user = await this.prisma.user.findUnique({
      where: { fullname: name }, // fullname must be unique in your schema
      select: {
        id: true,
        email: true,
        fullname: true,
        role: true,
        location: true,
        startHour: true,
        endHour: true,
        BudgetRange: true,
        profile_photo: true,
        projectType: true,
        packageType: true,
        firstTime: true
      },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }
  


  async getBudgetUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // Ensure this matches your DB field
      select: {
      
        BudgetRange:true
      },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }


  
  async getemailUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // Ensure this matches your DB field
      select: {
      
        email:true
      },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }


  
  async getTypeBusinessByUser(userId: string) {
    const user = await this.prisma.user.findMany({
      where: { id: userId }, // Ensure this matches your DB field
      select: {
        projectType:true
      },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }

  async getUsers(currentUserId?: string) {
    const whereCondition = currentUserId
      ? { id_users: { not: currentUserId } }
      : {};
  
    const users = await this.prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        id_users: true,
        fullname: true,
        profile_photo: true,
        email: true,
        phone: true
      }
    });
  
    return users;
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
        role:data.role || user.role,
        projectName:data.projectName || user.projectName,
        projectType: data.projectType || user.projectType,
        language:data.language||user.language,
        location:data.location||user.location,
        startHour:data.startHour||user.startHour,
        endHour:data.endHour||user.endHour,
        BudgetRange:data.BudgetRange|| user.BudgetRange,
        profile_photo: data.profile_photo || user.profile_photo,
        packageType:data.packageType  || user.packageType,
        firstTime: typeof data.firstTime === 'boolean' 
        ? data.firstTime 
        : user.firstTime
      
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
  async getAllUsers(currentUserId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
  
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        packageType: true,
        created_at: true,
        lastLogin: true, // Required to determine status
        profile_photo: true,
      },
    });
  
    // Add active status (based on last login)
    return users.map(user => {
      const isActiveToday =
        user.lastLogin && user.lastLogin >= today;
  
      return {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        packageType: user.packageType,
        joined: user.created_at,
        status: isActiveToday ? 'Active' : 'Inactive',
        profile_photo: user.profile_photo,
      };
    });
  }
  
 /**************************************************************** */
async createFreelanceProfile(userId: string, dto: CreateAssistantProfileDto) {
    return this.prisma.userAssistantProfile.create({
      data: {
        userId,
        ...dto,
        skills: dto.skills ?? [],
        plan:   dto.plan   ?? [],
        memory: dto.memory ?? [],
      },
    })
  }


 async getFreelanceProfile(userId: string) {
  return this.prisma.userAssistantProfile.findUnique({
    where: {
      userId,
    },
  });
}


}
