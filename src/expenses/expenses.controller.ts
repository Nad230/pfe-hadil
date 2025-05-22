
import {
    Body,
    Controller,
    Post,
    UseGuards,
    Request,
    Param,
    Get,
    Patch,
    Delete,
    Query,
    BadRequestException,
  } from '@nestjs/common';
  
  import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
  import { CreateExpenseDto } from './dto/create-expense.dto';
  import { ExpensesService } from './expenses.service';


  export type PeriodType = 'day' | 'month' | 'year';

export interface ExpenseTypeCount {
  type: string;
  count: number;
}

export interface ExpenseSummary {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  mostCommonType: ExpenseTypeCount | null;
}

export interface ExpenseComparisonResult {
  periodA: { date: Date; summary: ExpenseSummary };
  periodB: { date: Date; summary: ExpenseSummary };
  differences: {
    amountDiff: number;
    amountPctDiff: number | null;
    countDiff: number;
    countPctDiff: number | null;
    avgAmountDiff: number;
    avgAmountPctDiff: number | null;
  };
}
@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expenseService: ExpensesService) {}


    

  

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSalesSummary(
    @Request() req,
    @Query('period') period: 'day' | 'month' | 'year',
    @Query('date') date: string
  ) {
    const userId = req.user.sub;
    const dateObject = new Date(date);
    return this.expenseService.getExpenseSummaryByPeriod(userId, period, dateObject);
  }
  
  
  
  
  @UseGuards(JwtAuthGuard)
  @Get('Avreage')
  getTodayAverageExpense(@Request() req,
    @Query('date') date: string
) {
    const userId = req.user.sub;
        const dateObject = new Date(date);

    return this.expenseService.getTodayAverageExpense(userId,dateObject);
  
  }
  
  
  
  @UseGuards(JwtAuthGuard)
  @Get('by-period')
  getExpensesByPeriod(@Request() req,
  @Query('period') period: 'day' | 'month' | 'year', 
  @Query('date') date: string) {
    const userId = req.user.sub;
    const dateObject = new Date(date); // Convert date string to Date object
  
    return this.expenseService.getExpensesByPeriod(userId, period, dateObject);
  
  }
  
  // In your ExpenseController

@UseGuards(JwtAuthGuard)
@Get('type-breakdown')
getTypeBreakdownByPeriod(
  @Request() req,
  @Query('period') period: 'day' | 'month' | 'year',
  @Query('date') date: string
) {
  const userId = req.user.sub;
  const dateObject = new Date(date);
  return this.expenseService.getExpenseTypeBreakdownByPeriod(
    userId,
    period,
    dateObject
  );
}

@UseGuards(JwtAuthGuard)
  @Get('compare-periods')
  async getExpenseComparison(
    @Request() req,
    @Query('period') period: PeriodType,
    @Query('dateA') dateA: string,
    @Query('dateB') dateB: string,
  ): Promise<ExpenseComparisonResult> {
    const userId = req.user.sub;
    const dateObjA = new Date(dateA);
    const dateObjB = new Date(dateB);

    if (isNaN(dateObjA.getTime()) || isNaN(dateObjB.getTime())) {
      throw new BadRequestException('Invalid date format for dateA or dateB');
    }

    return await this.expenseService.getExpenseComparison(
      userId,
      period,
      dateObjA,
      dateObjB,
    );
  }

  
  @UseGuards(JwtAuthGuard)
  @Get('MostCommonExpenseType')
  getMostCommonExpense(@Request() req,
 @Query('period') period: 'day' | 'month' | 'year',
    @Query('date') date: string) {
    const userId = req.user.sub;
        const dateObject = new Date(date);

    return this.expenseService.getMostCommonExpenseTypeByPeriod(userId,period,dateObject);
}
@UseGuards(JwtAuthGuard)
  @Get('TodaycountOrder')
  getexpensestodaycount(@Request() req) {
    const userId = req.user.sub;
    return this.expenseService.getTodayExpenseCount(userId);
  
  }
    @UseGuards(JwtAuthGuard)
  @Get('total')
  getTotalExpenseUserId(@Request() req) {
    return this.expenseService.getTotalExpenseAmountByUser(req.user.sub);
  }
    @UseGuards(JwtAuthGuard)
  @Get('today')
  getExpenseUserId(@Request() req) {
    return this.expenseService.getTodayTotalExpense(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() dto: CreateExpenseDto) {
    return this.expenseService.createExpense(dto, req.user.sub);
  }
  @UseGuards(JwtAuthGuard)

  @Get()
  getAll(@Request() req) {
    return this.expenseService.getAllExpenses(req.user.sub);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.expenseService.getExpenseById(id);
  }


  @Get()
  getByUserId(@Request() req) {
    return this.expenseService.getExpensesByUserId(req.user.sub);
  }
    @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletebyId(@Request() req, @Param('id') id: string){
    return this.expenseService.deleteExpense(id,req.user.sub);
  }



}




