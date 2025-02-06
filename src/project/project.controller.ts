// src/project/project.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
@Post('create')
async create(@Request() req, @Body() data: CreateProjectDto) {
  console.log("Decoded user from JWT:", req.user); // Debugging
  return this.projectService.create(req.user.sub, data);
}

}
