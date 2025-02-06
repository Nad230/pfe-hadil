// src/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateProjectDto) {
    if (!userId) {
      throw new Error("User ID is missing in request.");
    }
  
    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        userId: userId, // Ensure userId is passed correctly
      },
    });
  }
  
}
