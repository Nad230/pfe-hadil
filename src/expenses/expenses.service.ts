import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { endOfDay, startOfDay } from 'date-fns';
import { startOfMonth, endOfMonth, startOfYear, endOfYear  ,startOfWeek, endOfWeek,
 } from 'date-fns';
type PeriodType = 'day' | 'month' | 'year' | 'week';
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
@Injectable()
export class ExpensesService {
    constructor(private prisma: PrismaService) {}
    async createExpense(dto: CreateExpenseDto, userId: string) {
        // Handle non-repeating expense
        if (!dto.repeat) {
          return this.prisma.expense.create({
            data: {
              title: dto.title,
              amount: dto.amount,
              type: dto.type,
              date: new Date(dto.date),
              userId,
              ...(dto.startDate && { startDate: new Date(dto.startDate) }),
              ...(dto.endDate && { endDate: new Date(dto.endDate) }),
            },
          });
        }
      
        // Handle repeating expense
        if (!dto.startDate || !dto.endDate || !dto.repeatType) {
          throw new Error('Repeating expenses require startDate, endDate, and repeatType');
        }
      
        return this.prisma.expense.create({
          data: {
            title: dto.title,
            amount: dto.amount,
            type: dto.type,
            date: new Date(dto.startDate), // first instance
            userId,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            repeat: true,
            repeatType: dto.repeatType,
          },
        });
      }
async deleteExpense(id: string, userId: string): Promise<void> {
  const expense = await this.prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    throw new NotFoundException('Expense not found');
  }

  if (expense.userId !== userId) {
    throw new NotFoundException('Expense not found for this user'); // or throw ForbiddenException if preferred
  }

  await this.prisma.expense.delete({
    where: { id },
  });
}


      async getTotalExpenseAmountByUser(userId: string) {
        const result = await this.prisma.expense.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            userId,
          },
        });
      
        return {
          totalAmount: result._sum.amount || 0,
        };
      }
      
      
  async getAllExpenses(userId:string) {
    return this.prisma.expense.findMany({
      where:{userId}
  });
  }

  async getExpenseById(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async getExpensesByUserId(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId },
    });
  }

 
    
   

  async getAllTimeTotalExpense(userId: string): Promise<number> {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
    });
  
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return total;
  }

  async getMonthTotalExpense(userId: string): Promise<number> {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
  
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });
  
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return total;
  }

  async getYearTotalExpense(userId: string): Promise<number> {
    const start = startOfYear(new Date());
    const end = endOfYear(new Date());
  
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });
  
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return total;
  }

  async getExpenseSummary(userId: string): Promise<{
  today: number;
  week: number;
  month: number;
  year: number;
  allTime: number;
}> {
  const [today, week, month, year, allTime] = await Promise.all([
    this.getTodayTotalExpense(userId),
    this.getWeekTotalExpense(userId),
    this.getMonthTotalExpense(userId),
    this.getYearTotalExpense(userId),
    this.getAllTimeTotalExpense(userId),
  ]);

  return {
    today,
    week,
    month,
    year,
    allTime,
  };
}

  /********************************************************************** */

  async getWeekTotalExpense(userId: string): Promise<number> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const expenses = await this.prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return total;
}

 async getTodayTotalExpense(userId: string): Promise<number> {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const expenses = await this.prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return total;
}
async getTodayExpenseCount(userId: string): Promise<number> {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const expenses = await this.prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  return expenses.length;
}
async getTodayAverageExpense(userId: string, date: Date): Promise<number> {
  const todayStart = startOfDay(date);
  const todayEnd = endOfDay(date);

  const expenses = await this.prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  if (expenses.length === 0) return 0;

  return total / expenses.length;
}

async getExpensesByPeriod(userId: string, type: PeriodType, date: Date) {
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

  return await this.prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
}

async getMostCommonExpenseTypeByPeriod(
  userId: string,
  type: PeriodType,
  date: Date
): Promise<{ type: string; count: number } | null> {
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

  const expenses = await this.prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    select: {
      type: true,
    },
  });

  if (expenses.length === 0) return null;

  const typeMap: Record<string, number> = {};

  for (const { type } of expenses) {
    typeMap[type] = (typeMap[type] || 0) + 1;
  }

  const mostCommon = Object.entries(typeMap).reduce(
    (max, [type, count]) => (count > max.count ? { type, count } : max),
    { type: '', count: 0 }
  );

  return mostCommon.count > 0 ? mostCommon : null;
}

async getExpenseSummaryByPeriod(
  userId: string,
  type: PeriodType,   // 'day' | 'week' | 'month' | 'year'
  date: Date
): Promise<{
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  mostCommonType: { type: string; count: number } | null;
}> {
  // 1. Determine date range
  let from: Date;
  let to: Date;

  switch (type) {
    case 'day':
      from = startOfDay(date);
      to   = endOfDay(date);
      break;
    case 'week':
      from = startOfWeek(date);
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

  // 2. Fetch expenses in range
  const expenses = await this.prisma.expense.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
  });

  // 3. Basic aggregates
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount  = expenses.length;
  const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

  // 4. Most common type
  const typeMap: Record<string, number> = {};
  for (const { type: t } of expenses) {
    typeMap[t] = (typeMap[t] || 0) + 1;
  }

  const most = Object.entries(typeMap).reduce(
    (max, [t, count]) => (count > max.count ? { type: t, count } : max),
    { type: '', count: 0 }
  );

  const mostCommonType = most.count > 0 ? most : null;

  // 5. Return
  return {
    totalAmount,
    totalCount,
    averageAmount,
    mostCommonType,
  };
}
async getExpenseTypeBreakdownByPeriod(
  userId: string,
  period: PeriodType,
  date: Date
): Promise<{ type: string; count: number }[]> {
  // 1. Fetch all expenses in the period
  const expenses = await this.getExpensesByPeriod(userId, period, date);

  // 2. Build a map of type → count
  const typeMap: Record<string, number> = {};
  for (const exp of expenses) {
    typeMap[exp.type] = (typeMap[exp.type] || 0) + 1;
  }

  // 3. Transform into an array
  return Object.entries(typeMap).map(([type, count]) => ({ type, count }));
}

 async getExpenseComparison(
    userId: string,
    type: PeriodType,
    dateA: Date,
    dateB: Date,
  ): Promise<ExpenseComparisonResult> {
    const summaryA = await this.getExpenseSummaryByPeriod(userId, type, dateA);
    const summaryB = await this.getExpenseSummaryByPeriod(userId, type, dateB);

    const amountDiff = summaryB.totalAmount - summaryA.totalAmount;
    const amountPctDiff = summaryA.totalAmount
      ? (amountDiff / summaryA.totalAmount) * 100
      : null;

    const countDiff = summaryB.totalCount - summaryA.totalCount;
    const countPctDiff = summaryA.totalCount
      ? (countDiff / summaryA.totalCount) * 100
      : null;

    const avgAmountDiff = summaryB.averageAmount - summaryA.averageAmount;
    const avgAmountPctDiff = summaryA.averageAmount
      ? (avgAmountDiff / summaryA.averageAmount) * 100
      : null;

    return {
      periodA: { date: dateA, summary: summaryA },
      periodB: { date: dateB, summary: summaryB },
      differences: {
        amountDiff,
        amountPctDiff,
        countDiff,
        countPctDiff,
        avgAmountDiff,
        avgAmountPctDiff,
      },
    };
  }
}

