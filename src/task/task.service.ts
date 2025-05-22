// src/task/task.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {  Prisma, TaskPriority, TaskType } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService  ) {}
  
  
  async create(userId: string, data: CreateTaskDto) {
  // 1️⃣ Validate milestone
  if (!data.milestoneId) {
    throw new BadRequestException('Milestone ID is required');
  }
  const milestone = await this.prisma.milestone.findUnique({
    where: { id: data.milestoneId },
    include: { project: true },
  });
  if (!milestone) {
    throw new NotFoundException('Milestone not found');
  }
  if (milestone.project.userId !== userId) {
    throw new ForbiddenException('Access denied: You do not own this project');
  }

  // 2️⃣ Create the Task record
  const task = await this.prisma.task.create({
    data: {
      name:           data.name,
      description:    data.description,
      status:         data.status       || 'ON_HOLD',
      priority:       data.priority     || 'MEDIUM',
      dueDate:        data.dueDate,
      startDate:      data.startDate,
      milestoneId:    data.milestoneId,
      assignedBy:     userId,
      estimatedTime:  data.estimatedTime,
      teamId:         data.teamId,
      dependencyStatus: data.dependencyStatus,
    },
  });

  // 3️⃣ Build a list of member-IDs to assign (supports both old & new DTO)
  const memberIds = data.assignedToIds
    ?? (data.assignedToId ? [data.assignedToId] : []);

  // 4️⃣ For each team-member ID, verify and create a TaskAssignment
  await Promise.all(memberIds.map(async (userIdToAssign) => {
    const tm = await this.prisma.teamMember.findFirst({
      where: {
        userId: userIdToAssign,
        teamId: data.teamId,
      },
    });
    if (!tm) {
      throw new BadRequestException(
        `Invalid assignedToId: user ${userIdToAssign} is not a member of team ${data.teamId}`
      );
    }
    return this.prisma.taskAssignment.create({
      data: {
        taskId:   task.id,
        memberId: tm.id,
      },
    });
  }));

  return task;
}

async getCurrentTask(userId: string) {
  const today = new Date();

  const currentTask = await this.prisma.task.findFirst({
    where: {
      OR: [
        { assignedToMembers: { some: { member: { userId } } } }, // Assigned via TaskAssignment
        { 
          assignedToMembers: { none: {} },
          milestone: { project: { userId } }
        }
      ],
      startDate: { lte: today },
      dueDate: { gte: today },
      status: { not: "Completed" }
    },
    include: {
      assignedToMembers: { include: { member: true } },
      milestone: { include: { project: true } },
      TaskComment: true,
      TaskDependency: true,
      TimeEntry: true,
    },
      orderBy: [
        { priority: "desc" },  // High-priority tasks first
        { startDate: "asc" }   // Earliest task first if same priority
      ],
      
    });
  
    console.log("Current task found:", currentTask);
  
   if (!currentTask) {
  console.log("No active task found. Fetching next upcoming task...");
  const nextTask = await this.prisma.task.findFirst({
  where: {
  OR: [
    { assignedToMembers: { some: { member: { userId } } } },
    {
      // was assignments: { none: {} },
      assignedToMembers: { none: {} },
      milestone: { project: { userId } }
    },
  ],
  startDate: { gt: today },
  status:    { not: "Completed" }
},
    orderBy: [
      { priority: "desc" },
      { startDate: "asc" }
    ],
    include: {
      assignedToMembers: true,
      milestone: { include: { project: true } },
      TaskComment: true,
      TaskDependency: true,
      TimeEntry: true,
    }
  });

  
      console.log("Next upcoming task found:", nextTask);
      return nextTask;
    }
  
    return currentTask;
  }
  
  async getAll(userId: string) {
    return this.prisma.milestone.findMany({
      where: {
        OR: [
          { assignedToId: userId },
          { tasks: { some: { assignedToMembers: { some: { member: { userId } } } } } },
          { project: { userId: userId } } // Include milestones for projects you own
        ]
      },
       include: {
      tasks: {
        include: {
          assignedToMembers: { include: { member: true } }, // Include assigned members
          assignedByUser: true,
          team: true,
        }
      }
    }
  });
}
  
  async getById(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        milestone: { project: { userId: userId } },
      },
     include: {
      assignedToMembers: { include: { member: true } }, // Updated
      assignedByUser: true,
      milestone: { include: { project: true } },
      team: true,
      TaskComment: true,
      TaskDependency: true,
      TimeEntry: true,
    },
  });
  
    if (!task) {
      throw new NotFoundException('Task not found');
    }
  
    return task;
  }
async getTasksByProjectId(userId: string, projectId: string) {
  const isOwner = await this.prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  let teamMember: { id: string } | null = null;

  if (!isOwner) {
    teamMember = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        team: {
          projects: {
            some: { id: projectId },
          },
        },
      },
    });

    if (!teamMember) {
      throw new BadRequestException(
        "User is not a member of the team associated with this project."
      );
    }
  }

  // Safely build conditions
  const orConditions: Prisma.TaskWhereInput[] = [];

  if (isOwner) {
    orConditions.push({
      milestone: {
        project: { userId },
      },
    });
  }

  if (teamMember) {
    orConditions.push({
      assignedToMembers: { some: { memberId: teamMember.id } },
    });
  }

  return this.prisma.task.findMany({
    where: {
      OR: orConditions,
      milestone: { projectId },
    },
    include: {
      assignedToMembers: { include: { member: true } },
      milestone: {
        include: {
          project: true,            
        },
      },
    },
  });
}


  
  async getTaskAIFieldsByIds(userId: string, taskIds: string) {
    const tasks = await this.prisma.task.findMany({
      where: {
        id:  taskIds ,  // Filters tasks by provided task IDs
      },
      select: {
        id: true,
        name: true,
      },
    });
  
    if (!tasks.length) {
      throw new NotFoundException('No AI-generated task data found for the given task IDs');
    }
  
    return { message: 'AI fields retrieved from selected tasks', tasks };
  }
  
  async getTaskAIFields(userId: string, projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where:{ milestone: {
        projectId: projectId,
        project: { userId: userId },
      },},
      select: {
        id: true,
        name: true,
      },
    });
  
    if (!tasks.length) {
      throw new NotFoundException('No AI-generated task data found for this project');
    }
  
    return { message: 'AI fields retrieved from tasks', tasks };
  }
  async getTasksByMemberId(userId: string) {
    console.log("Fetching tasks for userId:", userId);
  
    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { assignedBy: userId }, // Tasks where the user is the owner
{ assignedToMembers: { some: { member: { userId } } } },
        ],
      },
      include: {
        assignedToMembers: true,
        milestone: true,
      },
    });
  
    console.log("Tasks found:", tasks);
    return tasks;
  }
  
async update(userId: string, taskId: string, data: UpdateTaskDto) {
  // 1️⃣ Fetch existing task with its project-team context
  const existing = await this.prisma.task.findUnique({
    where: { id: taskId },
    include: {
      milestone: {
        include: {
          project: {
            select: { userId: true, teamId: true },
          },
        },
      },
    },
  });

  // 2️⃣ Verify that task exists and user has access
  if (!existing) {
    throw new NotFoundException('Task not found or access denied');
  }

  // 3️⃣ Determine the list of member-IDs to assign
  //    (supports either an array or the single-field fallback)
  const memberIds = data.assignedToIds
    ?? (data.assignedToId ? [data.assignedToId] : []);

  if (memberIds.length) {
    // 3a️⃣ Validate project has a team
    const teamId = existing.milestone.project.teamId;
    if (!teamId) {
      throw new BadRequestException('This project has no team.');
    }

    // 3b️⃣ For each ID, verify membership and prepare assignments
    const assignments = await Promise.all(memberIds.map(async (uid) => {
      const tm = await this.prisma.teamMember.findFirst({
        where: { userId: uid, teamId: teamId },
      });
      if (!tm) {
        throw new BadRequestException(`User ${uid} is not part of this team.`);
      }
      return { taskId, memberId: tm.id };
    }));

    // 3c️⃣ Clear out old assignments, then bulk-create new ones
    await this.prisma.taskAssignment.deleteMany({ where: { taskId } });
    await this.prisma.taskAssignment.createMany({
      data: assignments,
    });
  }

  // 4️⃣ Validate assignedById if provided
  if (data.assignedById) {
    const assigner = await this.prisma.user.findUnique({
      where: { id: data.assignedById },
    });
    if (!assigner) {
      throw new NotFoundException('Assigning user not found');
    }
  }

  // 5️⃣ Build the update payload, excluding assignment fields
  const updates = Object.fromEntries(Object.entries({
    name:          data.name,
    description:   data.description,
    status:        data.status,
    priority:      data.priority,
    dueDate:       data.dueDate,
    startDate:     data.startDate,
    completedAt:   data.completedAt,
    assignedBy:    data.assignedById,
    estimatedTime: data.estimatedTime,
    actualTime:    data.actualTime,
    dependencyStatus: data.dependencyStatus,
    teamId:        data.teamId,
  }).filter(([_, v]) => v !== undefined));

  // 6️⃣ Perform the update
  return this.prisma.task.update({
    where: { id: taskId },
    data:  updates,
  });
}

  
  async delete(userId: string, taskId: string) {
    const existing = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { milestone: { include: { project: true } } },
    });
  
    if (!existing || existing.milestone.project.userId !== userId) {
      throw new NotFoundException('Task not found or access denied');
    }
    await this.prisma.taskAssignment.deleteMany({
  where: { taskId: taskId },
        });
  
    await this.prisma.task.delete({
      where: { id: taskId },
    });
  
    return { message: 'Task deleted successfully' };
  }




  private readonly statusProgressMap: { [key: string]: number } = {
    'Not Started': 0,
    'Initiated': 30,
    'In Progress': 50,
    'Near Completion': 70,
    'Completed': 100,
  };

  // Function to retrieve task status and map to progress
  async getTaskProgressById(taskId: string): Promise<number> {
    // Query the database to retrieve the task's status
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { status: true },
    });
  
    if (!task || !task.status) {
      throw new NotFoundException(`Task with ID ${taskId} not found or has no status.`);
    }
  
    // Map the status to the corresponding progress percentage
    const progress = this.statusProgressMap[task.status];
    if (progress === undefined) {
      throw new NotFoundException(`Progress mapping not found for status: ${task.status}`);
    }
  
    return progress;
  }
  






  async getTaskStats(userId: string, projectId: string) {
    // Check if the user is associated with the project (owner or team member)
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId }, 
          { team: { members: { some: { userId } } } }
        ],
      },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('User does not have access to this project');
    }

    // Base filter for tasks linked to milestones within the given project
    const baseFilter = {
      milestone: {
        projectId,
      },
    };

    // Status-based counts
    const totalTasks = await this.prisma.task.count({ where: baseFilter });
    const completedTasks = await this.prisma.task.count({ where: { ...baseFilter, status: "completed" } });
    const activeTasks = await this.prisma.task.count({ where: { ...baseFilter, status: "active" } });
    const ideaTasks = await this.prisma.task.count({ where: { ...baseFilter, status: "idea" } });
    const inProgressTasks = await this.prisma.task.count({ where: { ...baseFilter, status: "in_progress" } });
    const pausedTasks = await this.prisma.task.count({ where: { ...baseFilter, status: "paused" } });
    const planningTasks = await this.prisma.task.count({ where: { ...baseFilter, status: "planning" } });
    const notstartedTasks = await this.prisma.task.count({ where: { ...baseFilter, status: "not_started" } });

    // Priority-based counts
    const lowPriorityTasks = await this.prisma.task.count({ where: { ...baseFilter, priority: "low" } });
    const mediumPriorityTasks = await this.prisma.task.count({ where: { ...baseFilter, priority: "medium" } });
    const highPriorityTasks = await this.prisma.task.count({ where: { ...baseFilter, priority: "high" } });
    
    return {
      totalTasks,
      completedTasks,
      activeTasks,
      ideaTasks,
      inProgressTasks,
      pausedTasks,
      planningTasks,
      lowPriorityTasks,
      mediumPriorityTasks,
      highPriorityTasks,
      notstartedTasks
    };
}

async getTaskStatsWithProgress(userId: string, projectId: string) {
  // Fetch task statistics
  const taskStats = await this.getTaskStats(userId, projectId);

  // Calculate progress percentage
  const progress = taskStats.totalTasks > 0 
      ? (taskStats.completedTasks / taskStats.totalTasks) * 100 
      : 0;

  return {
      ...taskStats,
      progress: progress.toFixed(2) // Keep two decimal places
  };
}





  async  getProjectTimeStats(projectId: string) {
    // Aggregate the total estimated time for tasks whose milestone is linked to the project
    const estimated = await this.prisma.task.aggregate({
      where: {
        milestone: {
          project: {
            id: projectId,
          },
        },
      },
      _sum: { estimatedTime: true },
    });
  
    // Retrieve tasks with non-null startDate and completedAt from the nested relations
    const tasks = await this.prisma.task.findMany({
      where: {
        milestone: {
          project: {
            id: projectId,
          },
        },
        completedAt: { not: null },
        startDate: { not: null }
      },
      select: {
        startDate: true,
        completedAt: true,
      },
    });
  
    // Calculate the total actual time in hours with a runtime check for non-null dates.
    const actualTime = tasks.reduce((total, task) => {
      if (task.completedAt && task.startDate) {
        const duration = (task.completedAt.getTime() - task.startDate.getTime()) / (1000 * 60 * 60);
        return total + duration;
      }
      return total;
    }, 0);
  
    return {
      estimatedTime: estimated._sum.estimatedTime || 0,
      actualTime,
    };
  }
  
  async getUpcomingDeadlines(projectId: string) {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
  
    const tasks = await this.prisma.task.findMany({
      where: {
        milestone: {
          project: {
            id: projectId,
          },
        },
        dueDate: {
          gte: today, // Greater than or equal to today
          lte: nextWeek, // Less than or equal to 7 days from today
        },
      },
      select: {
        id: true,
        name: true,
        dueDate: true,
        status:true,
        priority:true,
      },
    });
  
    return tasks;
  }
  
  
}


  
  
