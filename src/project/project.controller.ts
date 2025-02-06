// src/project/project.controller.ts
import { Controller, Post, Body, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async create(@Request() req, @Body() data: CreateProjectDto) {
    console.log("Decoded user from JWT:", req.user); // Debugging
    return this.projectService.create(req.user.sub, data);
    }
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
    @Request() req, 
    @Param('id') projectId: string, 
    @Body() data: UpdateProjectDto
    ) {
    console.log("Decoded user from JWT:", req.user);
    return this.projectService.update(req.user.sub, projectId, data);
    }


    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Request() req, @Param('id') projectId: string) {
    console.log("Decoded user from JWT:", req.user);
    return this.projectService.delete(req.user.sub, projectId);
    }


}
