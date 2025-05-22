import { Controller, Post, Body, Request, UseGuards, Param, Patch, Get, Req, Query, BadRequestException } from '@nestjs/common';
import { TimeEntryService } from './time-entry.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
type PeriodType = 'day' | 'month' | 'year';

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

@Controller('time-entry')
export class TimeEntryController {
  constructor(private readonly timeEntryService: TimeEntryService) {}

  
  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Request() req, @Body() data: CreateTimeEntryDto) {
    return this.timeEntryService.create(req.user.sub, data);
  }


  @Patch(':id/stop')
  async stopTimer(@Request() req, @Param('id') timeEntryId: string) {
    return this.timeEntryService.stopTimer(timeEntryId);
  }
 

  
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getTimeStats(@Request() req) {
    return this.timeEntryService.getTimeStats(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Get('todayTotal')
  findtoday(@Request() req) {
    const userId = req.user.sub;
    return this.timeEntryService.getTodayTotalDuration(userId);
  
  }
    @UseGuards(JwtAuthGuard)
  @Get('Notes')
  getNotes(@Request() req) {
    const userId = req.user.sub;
    return this.timeEntryService.getAllNotesWithDate(userId);
  
  }
  @UseGuards(JwtAuthGuard)

  @Patch(':id/add-note')
async appendNote(
  @Param('id') id: string,
  @Body('note') newNote: string,
  @Request() req
) {
  const userId = req.user?.id // Assuming auth is handled with a decorator/middleware
  return this.timeEntryService.appendNote(id, newNote, userId)
}








@UseGuards(JwtAuthGuard)
@Get('MostTimeSpentProjectByPeriod')
getMostTimeSpentProjectByPeriod(
  @Request() req,
  @Query('period') period: 'day' | 'month' | 'year',
  @Query('date') date: string
) {
  const userId = req.user.sub;
  const dateObject = new Date(date);
  return this.timeEntryService. getMostTimeSpentProjectByPeriod(userId, period, dateObject);
}

@UseGuards(JwtAuthGuard)
@Get('TodayEntryCount')
getTodayEntryCount(@Request() req) {
  const userId = req.user.sub;
  return this.timeEntryService.getTodayEntryCount(userId);

}


@UseGuards(JwtAuthGuard)
@Get('Avreage')
getTodayAverageDuration(@Request() req) {
  const userId = req.user.sub;
  return this.timeEntryService.getTodayAverageDuration(userId);

}



@UseGuards(JwtAuthGuard)
@Get('by-period')
gettimebyperiod(@Request() req,
@Query('period') period: 'day' | 'month' | 'year', 
@Query('date') date: string) {
  const userId = req.user.sub;
  const dateObject = new Date(date); // Convert date string to Date object

  return this.timeEntryService.getEntriesByPeriod(userId, period, dateObject);

}


@UseGuards(JwtAuthGuard)
@Get('summary')
geTimeSummarybyperiod(@Request() req,
@Query('period') period: 'day' | 'month' | 'year', 
@Query('date') date: string) {
  const userId = req.user.sub;
  const dateObject = new Date(date); // Convert date string to Date object

  return this.timeEntryService.getTimeSummaryByPeriod(userId, period, dateObject);

}


@UseGuards(JwtAuthGuard)
@Get('MostProductiveTimeOfDay')
getMostProductiveTime(@Request() req,
@Query('period') period: 'day' | 'month' | 'year', 
@Query('date') date: string) {
  const userId = req.user.sub;
  const dateObject = new Date(date); // Convert date string to Date object

  return this.timeEntryService.getMostProductiveTimeOfDay(userId, period, dateObject);

}






@UseGuards(JwtAuthGuard)
  @Get('compare-periods')
  async getExpenseComparison(
    @Request() req,
    @Query('period') period: PeriodType,
    @Query('dateA') dateA: string,
    @Query('dateB') dateB: string,
  ): Promise<TimeComparisonResult> {
    const userId = req.user.sub;
    const dateObjA = new Date(dateA);
    const dateObjB = new Date(dateB);

    if (isNaN(dateObjA.getTime()) || isNaN(dateObjB.getTime())) {
      throw new BadRequestException('Invalid date format for dateA or dateB');
    }

    return await this.timeEntryService.getTimeComparison(
      userId,
      period,
      dateObjA,
      dateObjB,
    );
  }


 @UseGuards(JwtAuthGuard)
  @Get()
async getAll(@Request() req) {
  const userId = req.user.sub; // Ensure authentication middleware sets this
  return this.timeEntryService.getAll(userId);
}



 @UseGuards(JwtAuthGuard)
  @Get('most-productive-hour')
  async getMostProductiveTimeOfDay(
    @Request() req,
    @Query('period') period: PeriodType,
    @Query('date') date: string,
  ): Promise<ProductiveHourResult | null> {
    const userId = req.user.sub;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return await this.timeEntryService.getMostProductiveTimeOfDay(userId, period, dateObj);
  }
}
