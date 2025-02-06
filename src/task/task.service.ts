import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateTaskDto) {
    if (!userId) {
      throw new Error('User ID is missing in request.');
    }

    return this.prisma.task.create({
      data: {
        title: data.name, // Using 'name' from DTO
        description: data.description,
        status: data.status || 'pending', // Default status
        userId: userId, // Assigning the task to the user
        projectId: data.projectId,
        estimatedHours: data.estimatedHours,
        updatedAt: new Date(),
      },
    });
  }
}
