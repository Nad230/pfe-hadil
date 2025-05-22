import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDigitalDto } from './dto/create-sale.dto';
import { UpdateSaleDigitalDto } from './dto/update-sale.dto';
import { endOfDay, startOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear,startOfWeek, endOfWeek } from 'date-fns';
import { SaleDigital } from '@prisma/client';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ProfitService } from 'src/profit/profit.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

type PeriodType = 'day' | 'month' | 'year' | 'week' ;

interface SummaryResult {
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
  bestClient: { clientId: string; name: string; totalRevenue: number } | null;
  bestProject: { projectId: string; name: string; totalRevenue: number } | null;
}
interface ComparisonResult {
  periodA: { date: Date; summary: SummaryResult };
  periodB: { date: Date; summary: SummaryResult };
  differences: {
    revenueDiff: number;
    revenuePctDiff: number | null;
    invoiceCountDiff: number;
    invoiceCountPctDiff: number | null;
    avgInvoiceValueDiff: number;
    avgInvoiceValuePctDiff: number | null;
  };
}
@UseGuards(JwtAuthGuard)
@Injectable()
export class SaleDigitalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expenseService: ExpensesService,
    private readonly profitService: ProfitService,
  ) {}

   async deleteSaleByInvoiceId(invoiceId: string): Promise<{ count: number }> {
  return this.prisma.saleDigital.deleteMany({
    where: { invoiceId },
  });
}
  
  async create(createSaleDigitalDto: CreateSaleDigitalDto, userId: string) {
    const { invoiceId } = createSaleDigitalDto;

    // Validate invoice ownership
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true }
    });

    if (!invoice || invoice.createdBy !== userId) {
      throw new Error('Unauthorized to add sale for this invoice');
    }

    return this.prisma.saleDigital.create({
      data: {
        invoiceId,
        userId,
        date: new Date(),
      },
    });
  }

  async createMany(salesDigital: CreateSaleDigitalDto[], userId: string) {
    const invoiceIds = salesDigital.map((sale) => sale.invoiceId);
  
    // Validate invoice ownership
    const ownedInvoices = await this.prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds },
        createdBy: userId,
      },
      select: { id: true },
    });
  
    const validIds = new Set(ownedInvoices.map(inv => inv.id));
  
    for (const sale of salesDigital) {
      if (!validIds.has(sale.invoiceId)) {
        throw new Error(`You are not allowed to create sale for invoice ${sale.invoiceId}`);
      }
    }
  
    // Create all sales
    const results: SaleDigital[] = [];
  
    for (const sale of salesDigital) {
      const created = await this.prisma.saleDigital.create({
        data: {
          invoiceId: sale.invoiceId,
          userId,
          date: new Date(),
        },
      });
      results.push(created);
    }
  
    return results;
  }

  async update(id: string, updateSaleDigitalDto: UpdateSaleDigitalDto, userId: string) {
    const sale = await this.prisma.saleDigital.findUnique({
      where: { id },
    });

    if (!sale || sale.userId !== userId) {
      throw new Error('Unauthorized or not found');
    }

    return this.prisma.saleDigital.update({
      where: { id },
      data: updateSaleDigitalDto,
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.saleDigital.findMany({
      where: { userId },
      include: { 
        invoice: {
          include: {
            client: true,
            items: true,
            project: true
          }
        } 
      },
      orderBy: { date: 'desc' },
    });
  }

  async getAllTimeTotal(userId: string): Promise<number> {
    const sales = await this.prisma.saleDigital.findMany({
      where: { userId },
      include: {
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });
  
    const total = sales.reduce((sum, sale) => {
      const invoiceTotal = sale.invoice.items.reduce(
        (itemSum, item) => itemSum + item.amount,
        0
      );
      return sum + invoiceTotal;
    }, 0);
  
    return total;
  }
  
  async getMonthTotal(userId: string): Promise<number> {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
  
    const sales = await this.prisma.saleDigital.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });
  
    const total = sales.reduce((sum, sale) => {
      const invoiceTotal = sale.invoice.items.reduce(
        (itemSum, item) => itemSum + item.amount,
        0
      );
      return sum + invoiceTotal;
    }, 0);
  
    return total;
  }
  
  async getYearTotal(userId: string): Promise<number> {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
  
    const sales = await this.prisma.saleDigital.findMany({
      where: {
        userId,
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      include: {
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });
  
    const total = sales.reduce((sum, sale) => {
      const invoiceTotal = sale.invoice.items.reduce(
        (itemSum, item) => itemSum + item.amount,
        0
      );
      return sum + invoiceTotal;
    }, 0);
  
    return total;
  }
  
  async getTodayTotal(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const sales = await this.prisma.saleDigital.findMany({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });
  
    const total = sales.reduce((sum, sale) => {
      const invoiceTotal = sale.invoice.items.reduce(
        (itemSum, item) => itemSum + item.amount,
        0
      );
      return sum + invoiceTotal;
    }, 0);
  
    return total;
  }

  async getWeekTotal(userId: string): Promise<number> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const sales = await this.prisma.saleDigital.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    include: {
      invoice: {
        include: {
          items: true,
        },
      },
    },
  });

  const total = sales.reduce((sum, sale) => {
    const invoiceTotal = sale.invoice.items.reduce(
      (itemSum, item) => itemSum + item.amount,
      0
    );
    return sum + invoiceTotal;
  }, 0);

  return total;
}


  async getTodayInvoiceCount(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const count = await this.prisma.saleDigital.count({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });
  
    return count;
  }
  
  async getTodayAverageInvoiceValue(userId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
  
    const sales = await this.prisma.saleDigital.findMany({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });
  
    const totalRevenue = sales.reduce((sum, sale) => {
      const invoiceTotal = sale.invoice.items.reduce(
        (itemSum, item) => itemSum + item.amount,
        0
      );
      return sum + invoiceTotal;
    }, 0);
  
    const count = sales.length;
  
    if (count === 0) return 0;
  
    return totalRevenue / count;
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
  salesDigital: {
    today: number;
    week: number;
    month: number;
    year: number;
    allTime: number;
  };
  profit: {
    today: number;
    week: number;
    month: number;
    year: number;
    allTime: number;
  };
  expense: {
    today: number;
    week: number;
    month: number;
    year: number;
    allTime: number;
  };
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
    salesWeek,
    salesMonth,
    salesYear,
    salesAllTime,

    expenseToday,
    expenseWeek,
    expenseMonth,
    expenseYear,
    expenseAllTime,
  ] = await Promise.all([
    safeCall(() => this.getTodayTotal(userId)),
    safeCall(() => this.getWeekTotal(userId)),
    safeCall(() => this.getMonthTotal(userId)),
    safeCall(() => this.getYearTotal(userId)),
    safeCall(() => this.getAllTimeTotal(userId)),

    safeCall(() => this.expenseService.getTodayTotalExpense(userId)),
    safeCall(() => this.expenseService.getWeekTotalExpense(userId)),
    safeCall(() => this.expenseService.getMonthTotalExpense(userId)),
    safeCall(() => this.expenseService.getYearTotalExpense(userId)),
    safeCall(() => this.expenseService.getAllTimeTotalExpense(userId)),
  ]);

  return {
    salesDigital: {
      today: salesToday,
      week: salesWeek,
      month: salesMonth,
      year: salesYear,
      allTime: salesAllTime,
    },
    profit: {
      today: salesToday - expenseToday,
      week: salesWeek - expenseWeek,
      month: salesMonth - expenseMonth,
      year: salesYear - expenseYear,
      allTime: salesAllTime - expenseAllTime,
    },
    expense: {
      today: expenseToday,
      week: expenseWeek,
      month: expenseMonth,
      year: expenseYear,
      allTime: expenseAllTime,
    },
  };
}



async getTopClientsByRevenue(
  userId: string,
  type: 'day' | 'week' | 'month' | 'year',
  date: Date,
  limit: number = 5
): Promise<Array<{ clientId: string; name: string; totalRevenue: number }>> {
  let from: Date;
  let to: Date;

  switch (type) {
    case 'day':
      from = startOfDay(date);
      to = endOfDay(date);
      break;
    case 'week':
      from = startOfWeek(date, { weekStartsOn: 1 });
      to = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case 'month':
      from = startOfMonth(date);
      to = endOfMonth(date);
      break;
    case 'year':
      from = startOfYear(date);
      to = endOfYear(date);
      break;
    default:
      throw new Error('Invalid period type');
  }

  const sales = await this.prisma.saleDigital.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    include: {
      invoice: {
        include: {
          client: true,
          items: true,
        },
      },
    },
  });

  const clientMap: Record<string, { name: string; totalRevenue: number }> = {};

  for (const sale of sales) {
    const clientId = sale.invoice.clientId;
    const clientName = sale.invoice.client?.name || 'Unknown';
    const invoiceTotal = sale.invoice.items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    if (!clientMap[clientId]) {
      clientMap[clientId] = {
        name: clientName,
        totalRevenue: invoiceTotal,
      };
    } else {
      clientMap[clientId].totalRevenue += invoiceTotal;
    }
  }

  const sortedClients = Object.entries(clientMap)
    .map(([clientId, data]) => ({
      clientId,
      ...data,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);

  return sortedClients;
}


async getTopProjectsByRevenue(
  userId: string,
  type: 'day' | 'week' | 'month' | 'year',
  date: Date,
  limit: number = 5
): Promise<Array<{ projectId: string; name: string; totalRevenue: number }>> {
  let from: Date;
  let to: Date;

  switch (type) {
    case 'day':
      from = startOfDay(date);
      to = endOfDay(date);
      break;
    case 'week':
      from = startOfWeek(date, { weekStartsOn: 1 });
      to = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case 'month':
      from = startOfMonth(date);
      to = endOfMonth(date);
      break;
    case 'year':
      from = startOfYear(date);
      to = endOfYear(date);
      break;
    default:
      throw new Error('Invalid period type');
  }

  const sales = await this.prisma.saleDigital.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    include: {
      invoice: {
        include: {
          project: true,
          items: true,
        },
      },
    },
  });

  const projectMap: Record<string, { name: string; totalRevenue: number }> = {};

  for (const sale of sales) {
    const project = sale.invoice.project;
    if (!project) continue;

    const projectId = project.id;
    const projectName = project.name || 'Unknown';
    const invoiceTotal = sale.invoice.items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    if (!projectMap[projectId]) {
      projectMap[projectId] = {
        name: projectName,
        totalRevenue: invoiceTotal,
      };
    } else {
      projectMap[projectId].totalRevenue += invoiceTotal;
    }
  }

  const sortedProjects = Object.entries(projectMap)
    .map(([projectId, data]) => ({
      projectId,
      ...data,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);

  return sortedProjects;
}






 async getSalesByPeriod(userId, type, date) {
  let from;
  let to;

  switch (type) {
    case 'day':
      from = startOfDay(date);
      to = endOfDay(date);
      break;

    case 'week':
      // Optionally specify weekStartsOn (0 = Sunday, 1 = Monday, etc.)
      from = startOfWeek(date, { weekStartsOn: 1 });  // Week starting Monday
      to = endOfWeek(date, { weekStartsOn: 1 });
      break;

    case 'month':
      from = startOfMonth(date);
      to = endOfMonth(date);
      break;

    case 'year':
      from = startOfYear(date);
      to = endOfYear(date);
      break;

    default:
      throw new Error(`Invalid period type: ${type}`);
  }

  const sales = await this.prisma.saleDigital.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    include: {
      invoice: {
        include: {
          client: true,
          items: true,
          project: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  return sales;
}

 async getBestClientByPeriod(
  userId: string,
  type: PeriodType,
  date: Date
): Promise<{ clientId: string; name: string; totalRevenue: number } | null> {
  let from: Date;
  let to: Date;

  if (type === 'day') {
    from = startOfDay(date);
    to = endOfDay(date);
  } else if (type === 'week') {
    // Week starting on Monday (adjust weekStartsOn as needed)
    from = startOfWeek(date, { weekStartsOn: 1 });
    to = endOfWeek(date, { weekStartsOn: 1 });
  } else if (type === 'month') {
    from = startOfMonth(date);
    to = endOfMonth(date);
  } else if (type === 'year') {
    from = startOfYear(date);
    to = endOfYear(date);
  } else {
    throw new Error('Invalid period type');
  }

  const sales = await this.prisma.saleDigital.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    include: {
      invoice: {
        include: {
          client: true,
          items: true,
        },
      },
    },
  });

  if (sales.length === 0) return null;

  const clientMap: Record<string, { name: string; totalRevenue: number }> = {};

  for (const sale of sales) {
    const { invoice } = sale;
    const clientId = invoice.clientId;
    const clientName = invoice.client.name || 'Unknown';

    const invoiceTotal = invoice.items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    if (!clientMap[clientId]) {
      clientMap[clientId] = {
        name: clientName,
        totalRevenue: invoiceTotal,
      };
    } else {
      clientMap[clientId].totalRevenue += invoiceTotal;
    }
  }

  const bestClient = Object.entries(clientMap).reduce(
    (max, [clientId, data]) =>
      data.totalRevenue > max.totalRevenue
        ? { clientId, ...data }
        : max,
    { clientId: '', name: '', totalRevenue: 0 }
  );

  return bestClient.totalRevenue > 0 ? bestClient : null;
}


  async getBestProjectByPeriod(
    userId: string,
    type: PeriodType,
    date: Date
  ): Promise<{ projectId: string; name: string; totalRevenue: number } | null> {
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
  
    const sales = await this.prisma.saleDigital.findMany({
      where: {
        userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        invoice: {
          include: {
            project: true,
            items: true,
          },
        },
      },
    });
  
    if (sales.length === 0) return null;
  
    const projectMap: Record<
      string,
      { name: string; totalRevenue: number }
    > = {};
  
    for (const sale of sales) {
      const { invoice } = sale;
      const projectId = invoice.projectId;
      const projectName = invoice.project.name || 'Unknown';
      
      const invoiceTotal = invoice.items.reduce(
        (sum, item) => sum + item.amount,
        0
      );
  
      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          name: projectName,
          totalRevenue: invoiceTotal,
        };
      } else {
        projectMap[projectId].totalRevenue += invoiceTotal;
      }
    }
  
    const bestProject = Object.entries(projectMap).reduce(
      (max, [projectId, data]) =>
        data.totalRevenue > max.totalRevenue
          ? { projectId, ...data }
          : max,
      { projectId: '', name: '', totalRevenue: 0 }
    );
  
    return bestProject.totalRevenue > 0 ? bestProject : null;
  }
  
  async getSalesSummaryByPeriod(
  userId: string,
  type: PeriodType,
  date: Date
): Promise<{
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
  bestClient: { clientId: string; name: string; totalRevenue: number } | null;
  bestProject: { projectId: string; name: string; totalRevenue: number } | null;
}> {
  let from: Date;
  let to: Date;

  if (type === 'day') {
    from = startOfDay(date);
    to = endOfDay(date);
  } else if (type === 'week') {
    from = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
    to = endOfWeek(date, { weekStartsOn: 1 });     // Sunday as end of week
  } else if (type === 'month') {
    from = startOfMonth(date);
    to = endOfMonth(date);
  } else if (type === 'year') {
    from = startOfYear(date);
    to = endOfYear(date);
  } else {
    throw new Error('Invalid period type');
  }

  const sales = await this.prisma.saleDigital.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    include: {
      invoice: {
        include: {
          client: true,
          project: true,
          items: true,
        },
      },
    },
  });

  let totalRevenue = 0;
  const invoiceCount = sales.length;

  const clientMap: Record<string, { name: string; totalRevenue: number }> = {};
  const projectMap: Record<string, { name: string; totalRevenue: number }> = {};

  for (const sale of sales) {
    const { invoice } = sale;
    const clientId = invoice.clientId;
    const projectId = invoice.projectId;
    const clientName = invoice.client.name || 'Unknown';
    const projectName = invoice.project.name || 'Unknown';

    const invoiceTotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    totalRevenue += invoiceTotal;

    // Track client data
    if (!clientMap[clientId]) {
      clientMap[clientId] = {
        name: clientName,
        totalRevenue: invoiceTotal,
      };
    } else {
      clientMap[clientId].totalRevenue += invoiceTotal;
    }

    // Track project data
    if (!projectMap[projectId]) {
      projectMap[projectId] = {
        name: projectName,
        totalRevenue: invoiceTotal,
      };
    } else {
      projectMap[projectId].totalRevenue += invoiceTotal;
    }
  }

  const averageInvoiceValue = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

  // Find best client
  const bestClient = Object.entries(clientMap).reduce(
    (max, [clientId, data]) =>
      data.totalRevenue > max.totalRevenue
        ? { clientId, ...data }
        : max,
    { clientId: '', name: '', totalRevenue: 0 }
  );

  // Find best project
  const bestProject = Object.entries(projectMap).reduce(
    (max, [projectId, data]) =>
      data.totalRevenue > max.totalRevenue
        ? { projectId, ...data }
        : max,
    { projectId: '', name: '', totalRevenue: 0 }
  );

  return {
    totalRevenue,
    invoiceCount,
    averageInvoiceValue,
    bestClient: bestClient.totalRevenue > 0 ? bestClient : null,
    bestProject: bestProject.totalRevenue > 0 ? bestProject : null,
  };
}

   async getSalesComparison(
    userId: string,
    type: PeriodType,
    dateA: Date,
    dateB: Date
  ): Promise<ComparisonResult> {
    const summaryA = await this.getSalesSummaryByPeriod(userId, type, dateA);
    const summaryB = await this.getSalesSummaryByPeriod(userId, type, dateB);

    const revenueDiff = summaryB.totalRevenue - summaryA.totalRevenue;
    const revenuePctDiff = summaryA.totalRevenue
      ? (revenueDiff / summaryA.totalRevenue) * 100
      : null;

    const invoiceCountDiff = summaryB.invoiceCount - summaryA.invoiceCount;
    const invoiceCountPctDiff = summaryA.invoiceCount
      ? (invoiceCountDiff / summaryA.invoiceCount) * 100
      : null;

    const avgInvoiceValueDiff = summaryB.averageInvoiceValue - summaryA.averageInvoiceValue;
    const avgInvoiceValuePctDiff = summaryA.averageInvoiceValue
      ? (avgInvoiceValueDiff / summaryA.averageInvoiceValue) * 100
      : null;

    return {
      periodA: { date: dateA, summary: summaryA },
      periodB: { date: dateB, summary: summaryB },
      differences: {
        revenueDiff,
        revenuePctDiff,
        invoiceCountDiff,
        invoiceCountPctDiff,
        avgInvoiceValueDiff,
        avgInvoiceValuePctDiff,
      },
    };
  }
}

