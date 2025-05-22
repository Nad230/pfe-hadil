import { TaskPriority, TaskType } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';

export class CreateTaskDto {
  name: string;
  milestoneId: string; // Now required
  description?: string;
  status?: string;  // Changed from string to string array
  priority?: string;
  type?:string;
  dueDate?: Date;
  startDate?: Date;
  estimatedTime?: number;
  teamId?: string;
  dependencyStatus?: string;
  aiSuggestions?: InputJsonValue;
  aiPriorityAdjustment?: string;
  aiTaskOptimization?: InputJsonValue;
    assignedToId?: string;

assignedToIds?: string[];  // ← an array of teamMember IDs
  assignedById?: string;  // ID of the user who assigned the task
  bestAction?:string;
  timeAllocation?:string;
}
