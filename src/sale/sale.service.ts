import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { endOfDay, startOfDay } from 'date-fns';
import { Sale } from '@prisma/client';
import { CreateDailyProfitDto } from './dto/create-daily-profit.dto';
import { startOfMonth, endOfMonth, startOfYear, endOfYear,  startOfWeek, endOfWeek } from 'date-fns';
import { AuthService } from 'src/auth/auth.service';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ProfitService } from 'src/profit/profit.service';
import { TimeEntryService } from 'src/time-entry/time-entry.service';

type PeriodType = 'day' | 'month' | 'year' | 'week';
const results: Sale[] = [];
export interface BestSellingProduct {
  productId: string;
  name: string;
  totalSold: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrderCount: number;
  averageOrderValue: number;
  bestSellingProduct: BestSellingProduct | null;
}

export interface SalesComparisonResult {
  periodA: { date: Date; summary: SalesSummary };
  periodB: { date: Date; summary: SalesSummary };
  differences: {
    revenueDiff: number;
    revenuePctDiff: number | null;
    orderCountDiff: number;
    orderCountPctDiff: number | null;
    avgOrderValueDiff: number;
    avgOrderValuePctDiff: number | null;
  };
}
@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService,
        private readonly timeService: TimeEntryService,

     private readonly expenseService: ExpensesService,


  ) {}



async getProfitSummaryByPeriod(
  userId: string,
  type: PeriodType,
  date: Date
): Promise<{
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  mostCommonExpenseType: { type: string; count: number; totalSpent: number } | null;
  bestSellingProduct: { productId: string; name: string; totalSold: number; revenueGenerated: number } | null;
  profitabilityInsight: string;
  totalDuration: number;
  revenuePerHour: number | null;
  profitPerHour: number | null;
  mostTimeSpentProject: { projectId: string; name: string; totalDuration: number } | null;
}> {
  const [salesSummary, expenseSummary, timeSummary] = await Promise.all([
    this.getSalesSummaryByPeriod(userId, type, date),
    this.expenseService.getExpenseSummaryByPeriod(userId, type, date),
    this.timeService.getTimeSummaryByPeriod(userId, type, date),
  ]);

  const totalRevenue = salesSummary.totalRevenue;
  const totalExpenses = expenseSummary.totalAmount;
  const profit = totalRevenue - totalExpenses;

  // Best Selling Product
  let bestSellingProduct: {
    productId: string;
    name: string;
    totalSold: number;
    revenueGenerated: number;
  } | null = null;

  if (salesSummary.bestSellingProduct) {
    const fullProduct = await this.prisma.product.findUnique({
      where: { id: salesSummary.bestSellingProduct.productId },
    });

    bestSellingProduct = {
      ...salesSummary.bestSellingProduct,
      revenueGenerated: fullProduct
        ? fullProduct.price * salesSummary.bestSellingProduct.totalSold
        : 0,
    };
  }

  // Most Common Expense Type
  let mostCommonExpenseType: {
    type: string;
    count: number;
    totalSpent: number;
  } | null = null;

  if (expenseSummary.mostCommonType !== null) {
    const mostCommonType = expenseSummary.mostCommonType;
    const expenses = await this.expenseService.getExpensesByPeriod(userId, type, date);

    const filteredExpenses = expenses.filter(
      (e) => e.type === mostCommonType.type
    );

    const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    mostCommonExpenseType = {
      type: mostCommonType.type,
      count: mostCommonType.count,
      totalSpent,
    };
  }

  // Time Tracking Metrics
  const totalDuration = timeSummary.totalDuration; // In hours
  const revenuePerHour = totalDuration > 0 ? totalRevenue / totalDuration : null;
  const profitPerHour = totalDuration > 0 ? profit / totalDuration : null;

  // Profitability Insight
  let profitabilityInsight = '';
  if (totalRevenue === 0 && totalExpenses > 0) {
    profitabilityInsight = 'No sales recorded, but you had expenses. Try focusing on sales generation.';
  } else if (profit < 0) {
    profitabilityInsight = 'You’re spending more than you earn. Consider reducing expenses or boosting sales.';
  } else if (profit > 0) {
    profitabilityInsight = 'Great! Your business is generating profit.';
  } else if (totalRevenue === 0 && totalExpenses === 0) {
    profitabilityInsight = 'No financial activity during this period.';
  } else {
    profitabilityInsight = 'You broke even this period.';
  }

  return {
    totalRevenue,
    totalExpenses,
    profit,
    mostCommonExpenseType,
    bestSellingProduct,
    profitabilityInsight,
    totalDuration,
    revenuePerHour,
    profitPerHour,
    mostTimeSpentProject: timeSummary.mostTimeSpentProject,
  };
}


async getProfitComparison(
  userId: string,
  type: PeriodType,
  dateA: Date,
  dateB: Date,
): Promise<{
  periodA: { date: Date; summary: Awaited<ReturnType<typeof this.getProfitSummaryByPeriod>> };
  periodB: { date: Date; summary: Awaited<ReturnType<typeof this.getProfitSummaryByPeriod>> };
  differences: {
    revenueDiff: number;
    revenuePctDiff: number | null;
    expenseDiff: number;
    expensePctDiff: number | null;
    profitDiff: number;
    profitPctDiff: number | null;
    revenuePerHourDiff: number | null;
    revenuePerHourPctDiff: number | null;
    profitPerHourDiff: number | null;
    profitPerHourPctDiff: number | null;
  };
}> {
  const [summaryA, summaryB] = await Promise.all([
    this.getProfitSummaryByPeriod(userId, type, dateA),
    this.getProfitSummaryByPeriod(userId, type, dateB),
  ]);

  // Revenue comparison
  const revenueDiff = summaryB.totalRevenue - summaryA.totalRevenue;
  const revenuePctDiff = summaryA.totalRevenue
    ? (revenueDiff / summaryA.totalRevenue) * 100
    : null;

  // Expense comparison
  const expenseDiff = summaryB.totalExpenses - summaryA.totalExpenses;
  const expensePctDiff = summaryA.totalExpenses
    ? (expenseDiff / summaryA.totalExpenses) * 100
    : null;

  // Profit comparison
  const profitDiff = summaryB.profit - summaryA.profit;
  const profitPctDiff = summaryA.profit
    ? (profitDiff / summaryA.profit) * 100
    : null;

  // Revenue per hour comparison
  const revenuePerHourDiff =
    summaryB.revenuePerHour !== null && summaryA.revenuePerHour !== null
      ? summaryB.revenuePerHour - summaryA.revenuePerHour
      : null;
  const revenuePerHourPctDiff =
    summaryA.revenuePerHour
      ? (revenuePerHourDiff! / summaryA.revenuePerHour) * 100
      : null;

  // Profit per hour comparison
  const profitPerHourDiff =
    summaryB.profitPerHour !== null && summaryA.profitPerHour !== null
      ? summaryB.profitPerHour - summaryA.profitPerHour
      : null;
  const profitPerHourPctDiff =
    summaryA.profitPerHour
      ? (profitPerHourDiff! / summaryA.profitPerHour) * 100
      : null;

  return {
    periodA: { date: dateA, summary: summaryA },
    periodB: { date: dateB, summary: summaryB },
    differences: {
      revenueDiff,
      revenuePctDiff,
      expenseDiff,
      expensePctDiff,
      profitDiff,
      profitPctDiff,
      revenuePerHourDiff,
      revenuePerHourPctDiff,
      profitPerHourDiff,
      profitPerHourPctDiff,
    },
  };
}


  async create(createSaleDto: CreateSaleDto, userId: string) {
    const { productId, ...rest } = createSaleDto;

    // Optional: validate product ownership
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.userId !== userId) {
      throw new Error('Unauthorized to add sale to this product');
    }

    return this.prisma.sale.create({
      data: {
        ...rest,
        productId,
        userId,
      },
    });
  }


  async createMany(sales: CreateSaleDto[], userId: string) {
    const productIds = sales.map((sale) => sale.productId);
  
    const ownedProducts = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId,
      },
      select: { id: true },
    });
  
    const validIds = new Set(ownedProducts.map(p => p.id));
  
    for (const sale of sales) {
      if (!validIds.has(sale.productId)) {
        throw new Error(`You are not allowed to create sale for product ${sale.productId}`);
      }
    }


  
    const results: Sale[] = []; // ✅ Fix is here
  
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    for (const sale of sales) {
      const existingSale = await this.prisma.sale.findFirst({
        where: {
          userId,
          productId: sale.productId,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });
  
      if (existingSale) {
        const updated = await this.prisma.sale.update({
          where: {
            id: existingSale.id,
          },
          data: {
            quantity: existingSale.quantity + sale.quantity,
          },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.sale.create({
          data: {
            ...sale,
            userId,
            date: new Date(),
          },
        });
        results.push(created);
      }
    }
  
    return results;
  }
  


  async getAllTimeTotal(userId: string): Promise<number> {
    const sales = await this.prisma.sale.findMany({
      where: { userId },
      include: {
        product: {
          select: { price: true },
        },
      },
    });
  
    const total = sales.reduce((sum, sale) => {
      return sum + (sale.product.price * sale.quantity);
    }, 0);
  
    return total;
  }
  
  async getMonthTotal(userId: string): Promise<number> {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
  
    const sales = await this.prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        product: {
          select: { price: true },
        },
      },
    });
  
    const total = sales.reduce((sum, sale) => {
      return sum + (sale.product.price * sale.quantity);
    }, 0);
  
    return total;
  }
  
  async getYearTotal(userId: string): Promise<number> {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
  
    const sales = await this.prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      include: {
        product: {
          select: { price: true },
        },
      },
    });
  
    const total = sales.reduce((sum, sale) => {
      return sum + (sale.product.price * sale.quantity);
    }, 0);
  
    return total;
  }
  async update(id: string, updateSaleDto: UpdateSaleDto, userId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
    });

    if (!sale || sale.userId !== userId) {
      throw new Error('Unauthorized or not found');
    }

    return this.prisma.sale.update({
      where: { id },
      data: updateSaleDto,
    });
  }

  async findAllByUser(userId: string) {
  return this.prisma.sale.findMany({
    where: { userId },
    include: { product: true }, // Optional: join product details
    orderBy: { date: 'desc' },
  });
}

async getSalesSummary(userId: string): Promise<{
  today: number;
  month: number;
  year: number;
  allTime: number;
}> {
  const [today, month, year, allTime] = await Promise.all([
    this.getTodayTotal(userId),
    this.getMonthTotal(userId),
    this.getYearTotal(userId),
    this.getAllTimeTotal(userId),
  ]);

  return {
    today,
    month,
    year,
    allTime,
  };
}

async getFullSummary(userId: string): Promise<{
  sales: { today: number; month: number; year: number; allTime: number };
  profit: { today: number; month: number; year: number; allTime: number };
  expense: { today: number; month: number; year: number; allTime: number };
}> {
  const safeCall = async (fn: () => Promise<number>): Promise<number> => {
    try {
      const result = await fn();
      return result ?? 0;
    } catch (error) {
      console.error("Error in summary function:", error);
      return 0;
    }
  };

  const [
    salesToday,
    salesMonth,
    salesYear,
    salesAllTime,

    expenseToday,
    expenseMonth,
    expenseYear,
    expenseAllTime,
  ] = await Promise.all([
    safeCall(() => this.getTodayTotal(userId)),
    safeCall(() => this.getMonthTotal(userId)),
    safeCall(() => this.getYearTotal(userId)),
    safeCall(() => this.getAllTimeTotal(userId)),

    safeCall(() => this.expenseService.getTodayTotalExpense(userId)),
    safeCall(() => this.expenseService.getMonthTotalExpense(userId)),
    safeCall(() => this.expenseService.getYearTotalExpense(userId)),
    safeCall(() => this.expenseService.getAllTimeTotalExpense(userId)),
  ]);

  return {
    sales: {
      today: salesToday,
      month: salesMonth,
      year: salesYear,
      allTime: salesAllTime,
    },
    profit: {
      today: salesToday - expenseToday,
      month: salesMonth - expenseMonth,
      year: salesYear - expenseYear,
      allTime: salesAllTime - expenseAllTime,
    },
    expense: {
      today: expenseToday,
      month: expenseMonth,
      year: expenseYear,
      allTime: expenseAllTime,
    },
  };
}



  // daily-profit.service.ts
async createProfit(dto: CreateDailyProfitDto,userId:string) {
  return this.prisma.dailyProfit.create({
    data: {
      userId: userId,
      date: dto.date,
      day:dto.day,
      revenue: dto.revenue,
      expenses: dto.expenses,
      timeWorked:dto.timeWorked,
      profit: dto.profit,
    },
  });
}


  /******************************************************************************************** */

  async getTodayTotal(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const sales = await this.prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        product: {
          select: {
            price: true,
          },
        },
      },
    });
  
    const total = sales.reduce((sum, sale) => {
      return sum + (sale.product.price * sale.quantity);
    }, 0);
  
    return total;
  }
  async getCorrectProfit(stats: {
  sales: { today: number; month: number; year: number; allTime: number };
  expense: { today: number; month: number; year: number; allTime: number };
}) {
  return {
    profit: {
      today: stats.sales.today - stats.expense.today,
      month: stats.sales.month - stats.expense.month,
      year: stats.sales.year - stats.expense.year,
      allTime: stats.sales.allTime - stats.expense.allTime,
    },
  };
}

  async getTodayOrderCount(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const sales = await this.prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        quantity: true,
      },
    });
  
    const totalOrders = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    return totalOrders;
  }

  
  async getTodayAverageOrderValue(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const sales = await this.prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        product: {
          select: {
            price: true,
          },
        },
      },
    });
  
    const totalRevenue = sales.reduce((sum, sale) => {
      return sum + sale.product.price * sale.quantity;
    }, 0);
  
    const totalQuantity = sales.reduce((sum, sale) => {
      return sum + sale.quantity;
    }, 0);
  
    if (totalQuantity === 0) return 0;
  
    return totalRevenue / totalQuantity;
  }
  

  async getSalesByPeriod(userId: string, type: PeriodType, date: Date) {
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
  
    const sales = await this.prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  
    return sales;
  }
  async getBestSellingProductByPeriod(
    userId: string,
    type: PeriodType,
    date: Date
  ): Promise<{ productId: string; name: string; totalSold: number } | null> {
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
  
    const sales = await this.prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      select: {
        productId: true,
        quantity: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    });
  
    if (sales.length === 0) return null;
  
    const productMap: Record<
      string,
      { name: string; totalSold: number }
    > = {};
  
    for (const sale of sales) {
      const { productId, quantity, product } = sale;
      if (!productMap[productId]) {
        productMap[productId] = {
          name: product.name,
          totalSold: quantity,
        };
      } else {
        productMap[productId].totalSold += quantity;
      }
    }
  
    const bestProduct = Object.entries(productMap).reduce(
      (max, [productId, data]) =>
        data.totalSold > max.totalSold
          ? { productId, ...data }
          : max,
      { productId: '', name: '', totalSold: 0 }
    );
  
    return bestProduct.totalSold > 0 ? bestProduct : null;
  }

  
async getSalesSummaryByPeriod(
  userId: string,
  type: PeriodType,       // 'day' | 'week' | 'month' | 'year'
  date: Date
): Promise<{
  totalRevenue: number;
  totalOrderCount: number;
  averageOrderValue: number;
  bestSellingProduct: { productId: string; name: string; totalSold: number } | null;
}> {
  let from: Date;
  let to: Date;

  switch (type) {
    case 'day':
      from = startOfDay(date);
      to   = endOfDay(date);
      break;
    case 'week':
      from = startOfWeek(date);   // default weekStartsOn Sunday
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

  const sales = await this.prisma.sale.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    include: {
      product: {
        select: { name: true, price: true },
      },
    },
  });

  let totalRevenue = 0;
  let totalOrderCount = 0;
  const productMap: Record<string, { name: string; totalSold: number }> = {};

  for (const { productId, quantity, product } of sales) {
    const revenue = product.price * quantity;
    totalRevenue += revenue;
    totalOrderCount += quantity;

    if (!productMap[productId]) {
      productMap[productId] = { name: product.name, totalSold: quantity };
    } else {
      productMap[productId].totalSold += quantity;
    }
  }

  const averageOrderValue = 
    totalOrderCount > 0 ? totalRevenue / totalOrderCount : 0;

  // find best-seller
  const best = Object.entries(productMap).reduce(
    (max, [productId, data]) =>
      data.totalSold > max.totalSold
        ? { productId, ...data }
        : max,
    { productId: '', name: '', totalSold: 0 }
  );

  return {
    totalRevenue,
    totalOrderCount,
    averageOrderValue,
    bestSellingProduct:
      best.totalSold > 0
        ? best
        : null
  };
}
 async getSalesComparison(
    userId: string,
    type: PeriodType,
    dateA: Date,
    dateB: Date,
  ): Promise<SalesComparisonResult> {
    const summaryA = await this.getSalesSummaryByPeriod(userId, type, dateA);
    const summaryB = await this.getSalesSummaryByPeriod(userId, type, dateB);

    const revenueDiff = summaryB.totalRevenue - summaryA.totalRevenue;
    const revenuePctDiff = summaryA.totalRevenue
      ? (revenueDiff / summaryA.totalRevenue) * 100
      : null;

    const orderCountDiff = summaryB.totalOrderCount - summaryA.totalOrderCount;
    const orderCountPctDiff = summaryA.totalOrderCount
      ? (orderCountDiff / summaryA.totalOrderCount) * 100
      : null;

    const avgOrderValueDiff = summaryB.averageOrderValue - summaryA.averageOrderValue;
    const avgOrderValuePctDiff = summaryA.averageOrderValue
      ? (avgOrderValueDiff / summaryA.averageOrderValue) * 100
      : null;

    return {
      periodA: { date: dateA, summary: summaryA },
      periodB: { date: dateB, summary: summaryB },
      differences: {
        revenueDiff,
        revenuePctDiff,
        orderCountDiff,
        orderCountPctDiff,
        avgOrderValueDiff,
        avgOrderValuePctDiff,
      },
    };
  }
}

