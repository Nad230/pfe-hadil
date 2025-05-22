// dto/update-ai-plan-task.dto.ts
import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class UpdateAiPlanTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  plannedDate?: string | null;
}