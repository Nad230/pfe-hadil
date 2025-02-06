// src/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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
  async update(userId: string, projectId: string, data: UpdateProjectDto) {
    if (!userId) {
      throw new Error("User ID is missing in request.");
    }
  
    // Check if project belongs to user
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
  
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied.");
    }
  
    // Update project
    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }
  async delete(userId: string, projectId: string) {
    if (!userId) {
      throw new Error("User ID is missing in request.");
    }
  
    // Check if project belongs to user
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
  
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied.");
    }
  
    // Delete project
    await this.prisma.project.delete({
      where: { id: projectId },
    });
  
    return { message: "Project deleted successfully" }; // Return success message
  }
  
  
  
}
