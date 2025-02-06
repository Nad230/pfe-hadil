import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Request() req, @Body() data: CreateTaskDto) {
    console.log("Decoded user from JWT:", req.user); // Debugging
    return this.taskService.create(req.user.sub, data);
  }
}
