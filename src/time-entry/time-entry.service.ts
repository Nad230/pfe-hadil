import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear ,
    startOfWeek, endOfWeek,

} from 'date-fns';
type PeriodType = 'day' | 'month' | 'year' | 'week';
export interface ProjectDurationResult {
  projectId: string;
  name: string;
  totalDuration: number;
}

export interface TimeSummaryResult {
  totalDuration: number;
  entryCount: number;
  averageDuration: number;
  mostTimeSpentProject: ProjectDurationResult | null;
}

export interface ProductiveHourResult {
  hour: number;
  totalDuration: number;
}

export interface TimeComparisonResult {
  periodA: { date: Date; summary: TimeSummaryResult };
  periodB: { date: Date; summary: TimeSummaryResult };
  differences: {
    durationDiff: number;
    durationPctDiff: number | null;
    entryCountDiff: number;
    entryCountPctDiff: number | null;
    avgDurationDiff: number;
    avgDurationPctDiff: number | null;
  };
}

@Injectable()
export class TimeEntryService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateTimeEntryDto) {
    return this.prisma.timeEntry.create({
      data: {
        userId,
        projectId: data.projectId,
        taskId: data.taskId,
        teamId: data.teamId, // Allow team tracking
        notes: data.notes,
        startTime: new Date(),
        endTime: data.endTime,  // Ensure Prisma accepts the required field

        status: 'in-progress', // Default status
      },
    });
  }

  async getAll(userId: string) {
  return this.prisma.timeEntry.findMany({
    where: {
      OR: [
        {
          userId: userId, // time entry is mine
        },
        {
          AND: [
            { projectId: { not: null } },
            {
              project: {
                userId: userId, // I own the project
              },
            },
          ],
        },
        {
          AND: [
            { taskId: { not: null } },
            {
              task: {
                assignedToMembers: {
                  some: {
                    memberId: userId, // I'm assigned to the task
                  },
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      project: true,
      task: {
        include: {
          assignedToMembers: true,
        },
      },
    },
    orderBy: {
      startTime: 'desc',
    },
  });
}

async getAllNotesWithDate(userId: string) {
  const entries = await this.prisma.timeEntry.findMany({
    where: {
      userId,
      notes: {
        not: null,
      },
    },
    select: {
      id: true,
      notes: true,
      startTime: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  });

  return entries.map(entry => ({
    id: entry.id,
    notes: entry.notes,
    date: entry.startTime,
  }));
}



  async stopTimer(timeEntryId: string) {
    const timeEntry = await this.prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
    });
  
    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }
  
    // Ensure startTime is a valid Date
    if (!timeEntry.startTime) {
      throw new Error("Start time is missing for this time entry.");
    }
  
    // Ensure endTime is a valid Date (set to current time if not provided)
    const endTime = new Date(); 
  
    // Convert time difference from milliseconds to hours (rounded to 2 decimals)
    const duration = Math.round(((endTime.getTime() - new Date(timeEntry.startTime).getTime()) / (1000 * 60 * 60)) * 100) / 100;
  
    return this.prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: { endTime, duration, status: 'completed' },
    });
  }
  
  async countTrackedProjects(userId: string): Promise<number> {
    const uniqueProjects = await this.prisma.timeEntry.findMany({
      where: { userId },
      select: { projectId: true },
      distinct: ['projectId'],
    });

    return uniqueProjects.length;
  }

 async getTimeStats(userId: string) {
  const now = new Date();

  // Calculate range starts
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Aggregate times
  const todayTotal = await this.getTotalTime(userId, startOfToday, now);
  const weeklyTotal = await this.getTotalTime(userId, startOfWeek, now);
  const monthlyTotal = await this.getTotalTime(userId, startOfMonth, now);
  
  // Total all time (from earliest record)
  const allTimeStart = new Date(0);
  const allTimeTotal = await this.getTotalTime(userId, allTimeStart, now);

  const projectsTracked = await this.countTrackedProjects(userId);

  return {
    today: todayTotal,
    weekly: weeklyTotal,
    monthly: monthlyTotal,
    allTime: allTimeTotal,
    projectsTracked,
  };
}

  private async getTotalTime(userId: string, startDate: Date, endDate: Date) {
    const result = await this.prisma.timeEntry.aggregate({
      _sum: { duration: true },
      where: {
        userId,
        startTime: { gte: startDate, lte: endDate },
      },
    });

    return result._sum.duration || 0;
  }

  async appendNote(id: string, newNote: string, userId: string) {
    const existing = await this.prisma.timeEntry.findUnique({
      where: { id },
      select: {
        notes: true,
        userId: true,
      }
    })
  
    if (!existing) {
      throw new NotFoundException('Time entry not found')
    }
  
   
  
    const updatedNote = [existing.notes, newNote].filter(Boolean).join('\n')
  
    return this.prisma.timeEntry.update({
      where: { id },
      data: { notes: updatedNote }
    })
  }
  


  async getTodayTotalDuration(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const entries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        duration: true,
      },
    });
  
    const totalDuration = entries.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);
  
    return totalDuration; // You can divide by 60 if you want it in hours instead of minutes
  }
  
  /************************************************************************ */

  
  async getTodayEntryCount(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const count = await this.prisma.timeEntry.count({
      where: {
        userId,
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });
  
    return count;
  }
  
  async getTodayAverageDuration(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const entries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        duration: true,
      },
    });
  
    const totalDuration = entries.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);
  
    if (entries.length === 0) return 0;
  
    return totalDuration / entries.length;
  }
  
  async getEntriesByPeriod(userId: string, type: PeriodType, date: Date) {
    let from: Date;
    let to: Date;
  
    if (type === 'day') {
      from = startOfDay(date);
      to = endOfDay(date);
    } else if (type === 'month') {
      from = startOfMonth(date);
      to = endOfMonth(date);
    } else if (type === 'year') {
      from = startOfYear(date);
      to = endOfYear(date);
    } else {
      throw new Error('Invalid period type');
    }
  
    const entries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: {
          gte: from,
          lte: to,
        },
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        task: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  
    return entries;
  }
  
  async getMostTimeSpentProjectByPeriod(
    userId: string,
    type: PeriodType,
    date: Date
  ): Promise<{ projectId: string; name: string; totalDuration: number } | null> {
    let from: Date;
    let to: Date;
  
    if (type === 'day') {
      from = startOfDay(date);
      to = endOfDay(date);
    } else if (type === 'month') {
      from = startOfMonth(date);
      to = endOfMonth(date);
    } else if (type === 'year') {
      from = startOfYear(date);
      to = endOfYear(date);
    } else {
      throw new Error('Invalid period type');
    }
  
    const entries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: {
          gte: from,
          lte: to,
        },
      },
      select: {
        projectId: true,
        duration: true,
        project: {
          select: {
            name: true,
          },
        },
      },
    });
  
    if (entries.length === 0) return null;
  
    const projectMap: Record<string, { name: string; totalDuration: number }> = {};
  
    for (const entry of entries) {
      const { projectId, duration, project } = entry;
      if (!projectId) continue; // Skip entries without a project
      
      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          name: project?.name || 'Unknown Project',
          totalDuration: duration || 0,
        };
      } else {
        projectMap[projectId].totalDuration += (duration || 0);
      }
    }
  
    const projectEntries = Object.entries(projectMap);
    if (projectEntries.length === 0) return null;
    
    const mostTimeProject = projectEntries.reduce(
      (max, [projectId, data]) =>
        data.totalDuration > max.totalDuration
          ? { projectId, ...data }
          : max,
      { projectId: '', name: '', totalDuration: 0 }
    );
  
    return mostTimeProject.totalDuration > 0 ? mostTimeProject : null;
  }
  
  async getTimeSummaryByPeriod(
  userId: string,
  type: PeriodType,   // now supports 'day' | 'week' | 'month' | 'year'
  date: Date
): Promise<{
  totalDuration: number;
  entryCount: number;
  averageDuration: number;
  mostTimeSpentProject: { projectId: string; name: string; totalDuration: number } | null;
}> {
  // 1) Determine the range
  let from: Date;
  let to: Date;

  switch (type) {
    case 'day':
      from = startOfDay(date);
      to   = endOfDay(date);
      break;
    case 'week':
      from = startOfWeek(date);   // Sunday→Saturday by default
      to   = endOfWeek(date);
      break;
    case 'month':
      from = startOfMonth(date);
      to   = endOfMonth(date);
      break;
    case 'year':
      from = startOfYear(date);
      to   = endOfYear(date);
      break;
    default:
      throw new Error(`Invalid period type: ${type}`);
  }

  // 2) Fetch entries
  const entries = await this.prisma.timeEntry.findMany({
    where: { userId, startTime: { gte: from, lte: to } },
    include: { project: { select: { name: true } } },
  });

  // 3) Aggregate
  let totalDuration = 0;
  const entryCount = entries.length;
  const projectMap: Record<string, { name: string; totalDuration: number }> = {};

  for (const entry of entries) {
    const entryDuration = entry.duration ?? 0;  // coerce null → 0
    totalDuration += entryDuration;

    if (entry.projectId) {
      const existing = projectMap[entry.projectId];
      if (existing) {
        existing.totalDuration += entryDuration;
      } else {
        projectMap[entry.projectId] = {
          name: entry.project?.name ?? 'Unknown Project',
          totalDuration: entryDuration,
        };
      }
    }
  }

  const averageDuration = entryCount > 0 ? totalDuration / entryCount : 0;

  // 4) Top project
  const top = Object.entries(projectMap).reduce(
    (max, [pid, data]) =>
      data.totalDuration > max.totalDuration
        ? { projectId: pid, ...data }
        : max,
    { projectId: '', name: '', totalDuration: 0 }
  );
  const mostTimeSpentProject =
    top.totalDuration > 0 ? top : null;

  // 5) Return
  return {
    totalDuration,
    entryCount,
    averageDuration,
    mostTimeSpentProject,
  };
}
  
  async getMostProductiveTimeOfDay(
    userId: string,
    type: PeriodType,
    date: Date
  ): Promise<{ hour: number; totalDuration: number } | null> {
    let from: Date;
    let to: Date;
  
    if (type === 'day') {
      from = startOfDay(date);
      to = endOfDay(date);
    } else if (type === 'month') {
      from = startOfMonth(date);
      to = endOfMonth(date);
    } else if (type === 'year') {
      from = startOfYear(date);
      to = endOfYear(date);
    } else {
      throw new Error('Invalid period type');
    }
  
    const entries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: {
          gte: from,
          lte: to,
        },
      },
      select: {
        startTime: true,
        duration: true,
      },
    });
  
    if (entries.length === 0) return null;
  
    // Group entries by hour of day
    const hourMap: Record<number, number> = {};
  
    for (const entry of entries) {
    const hour = new Date(entry.startTime!).getHours();
      const duration = entry.duration || 0;
      
      hourMap[hour] = (hourMap[hour] || 0) + duration;
    }
  
    const hourEntries = Object.entries(hourMap);
    if (hourEntries.length === 0) return null;
    
    const mostProductiveHour = hourEntries.reduce(
      (max, [hourStr, duration]) => {
        const hour = parseInt(hourStr);
        return duration > max.totalDuration
          ? { hour, totalDuration: duration }
          : max;
      },
      { hour: -1, totalDuration: 0 }
    );
  
    return mostProductiveHour.totalDuration > 0 ? mostProductiveHour : null;
  }
 async getTimeComparison(
    userId: string,
    type: PeriodType,
    dateA: Date,
    dateB: Date,
  ): Promise<TimeComparisonResult> {
    const summaryA = await this.getTimeSummaryByPeriod(userId, type, dateA);
    const summaryB = await this.getTimeSummaryByPeriod(userId, type, dateB);

    const durationDiff = summaryB.totalDuration - summaryA.totalDuration;
    const durationPctDiff = summaryA.totalDuration
      ? (durationDiff / summaryA.totalDuration) * 100
      : null;

    const entryCountDiff = summaryB.entryCount - summaryA.entryCount;
    const entryCountPctDiff = summaryA.entryCount
      ? (entryCountDiff / summaryA.entryCount) * 100
      : null;

    const avgDurationDiff = summaryB.averageDuration - summaryA.averageDuration;
    const avgDurationPctDiff = summaryA.averageDuration
      ? (avgDurationDiff / summaryA.averageDuration) * 100
      : null;

    return {
      periodA: { date: dateA, summary: summaryA },
      periodB: { date: dateB, summary: summaryB },
      differences: {
        durationDiff,
        durationPctDiff,
        entryCountDiff,
        entryCountPctDiff,
        avgDurationDiff,
        avgDurationPctDiff,
      },
    };
  }
}


