import { IsOptional, IsString, IsEnum, IsDateString, isInt, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum({ pending: 'pending', 'in-progress': 'in-progress', completed: 'completed' })
  status: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;


  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}
