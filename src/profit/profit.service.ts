import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ExpensesService } from 'src/expenses/expenses.service';
import { SaleService } from 'src/sale/sale.service';
type PeriodType = 'day' | 'month' | 'year';

interface StructuredAdvice {
  weeklyCalendar: DailyTask[];
  bundlesAndOffers: Bundle[];
  bakingPlan: BakingItem[];
  timeDayStrategy: TimeStrategy[];
  businessSummary?: BusinessSummary; // Add business summary section
  profitabilityPlan?: ProfitabilityPlan; // Add profitability plan
  expenseOptimization?: ExpenseOptimization; // Add expense optimization
  revenueGrowthStrategy?: RevenueGrowthStrategy; // Add revenue strategy
  dayOptimization?: DayOptimization; // Add day optimization
  kpiDashboard?: string[]; // Add KPI dashboard items
  marketingCalendar?: MarketingEvent[]; // Add marketing calendar
  monthlyChallenge?: MonthlyChallenge; // Add monthly challenge targets
  originalAdvice: any; // Keep the original data for reference
}

// Daily tasks and schedule
interface DailyTask {
  day: string;
  tasks: {
    time: string;
    description: string;
  }[];
}

// Bundle and product offers
interface Bundle {
  name: string;
  items: string[];
  regularPrice: number;
  bundlePrice: number;
  discount: string;
}

// Baking and inventory planning
interface BakingItem {
  day: string;
  products: {
    name: string;
    quantity: number;
  }[];
}

// Time of day strategy
interface TimeStrategy {
  timeOfDay: string;
  product: string;
  strategy: string;
}

// New: Business summary metrics
interface BusinessSummary {
  monthlyProfit: number;
  profitMargin: string;
  expenseRatio: string;
  bestSellingProduct: string;
  bestRevenueDay: {
    day: string;
    revenue: number;
  };
  worstProfitDay: {
    day: string;
    profit: number;
  };
}

// New: Profitability plan
interface ProfitabilityPlan {
  currentMargin: string;
  strategies: string[];
  projectedImpact: string;
}

// New: Expense optimization
interface ExpenseOptimization {
  currentExpenses: number;
  strategies: {
    description: string;
    saving: number;
  }[];
  projectedSavings: number;
  projectedExpenseRatio: string;
}

// New: Revenue growth strategy
interface RevenueGrowthStrategy {
  currentRevenue: number;
  strategies: {
    description: string;
    projectedRevenue: number;
  }[];
  projectedTotalRevenue: number;
}

// New: Day optimization
interface DayOptimization {
  dayStrategies: {
    day: string;
    currentProfit: number;
    strategy: string;
    projectedProfit?: number;
  }[];
}

// New: Marketing calendar event
interface MarketingEvent {
  day: string;
  promotion: string;
  product: string;
}

// New: Monthly challenge targets
interface MonthlyChallenge {
  revenueTarget: number;
  expenseTarget: number;
  profitTarget: number;
  marginTarget: string;
}

@Injectable()
export class ProfitService {
  constructor(private prisma: PrismaService,
        

  ) {}





  
 async getDigitalAdviceai(userId: string) {
  const res = await this.prisma.aiBusinessAdvice.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  return res;
}



   async  getStructuredAdviceByUser(userId: string) {
  // First, get the original data from the API
  const originalAdvice = await this.prisma.aiBusinessAdvice.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  
const structuredData: StructuredAdvice[] = [];
  
  // Process each advice entry
  for (const advice of originalAdvice) {
    // For all categories of advice
  const structured: StructuredAdvice = {
  weeklyCalendar: await this.extractWeeklyCalendar(advice.message),
  bundlesAndOffers: await this.extractBundlesAndOffers(advice.message),
  bakingPlan: await this.extractBakingPlan(advice.message),
  timeDayStrategy: await this.extractTimeDayStrategy(advice.message),
  originalAdvice: advice,
};
structuredData.push(structured);

  }
  
  return structuredData;
}

// Generic approach to extract weekly calendar tasks from any format
async extractWeeklyCalendar(message: string): Promise<DailyTask[]> {
  const weeklyCalendar: DailyTask[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Try multiple patterns to find schedule information
  const schedulePatterns = [
    /📆\s*WEEKLY\s*SCHEDULE:[\s\S]*?(?=\d+\.\s*📢|$)/i,
    /WEEKLY\s*SCHEDULE[\s\S]*?(?=\n\n|$)/i,
    /schedule[\s\S]*?for.*?week[\s\S]*?(?=\n\n|$)/i,
    /Weekly schedule[\s\S]*?(?=\n\n|$)/i
  ];
  
  let scheduleSection = "";
  for (const pattern of schedulePatterns) {
    const match = message.match(pattern);
    if (match) {
      scheduleSection = match[0];
      break;
    }
  }
  
  if (!scheduleSection) {
    // If no dedicated section found, look for day mentions throughout the message
    for (const day of days) {
const tasks: { time: string; description: string }[] = [];
      
      // Look for day mentions with time patterns
      const dayPattern = new RegExp(`${day}[:\\s]([\\s\\S]*?)(?=(${days.join('|')}):|$)`, 'i');
      const dayMatch = message.match(dayPattern);
      
      if (dayMatch) {
        
        const dayContent = dayMatch[1].trim();
      const timeEntries: { time: string; description: string }[] = dayContent.split('\n')
  .filter(line => /\b\d{1,2}(:\d{2})?\s*(am|pm)?\b/i.test(line))
  .map(line => {
    const timeMatch = line.match(/\b\d{1,2}(:\d{2})?\s*(am|pm)?\b/i);
    if (!timeMatch) return null;

    const time = timeMatch[0].trim();
    const description = line.replace(timeMatch[0], '').replace(/[-–—]\s*/, '').trim();
    return { time, description };
  })
  .filter((entry): entry is { time: string; description: string } => entry !== null); // type guard


if (timeEntries.length > 0) {
  tasks.push(...timeEntries);
}

      }
      
      if (tasks.length > 0) {
        weeklyCalendar.push({ day, tasks });
      }
    }
  } else {
    // Process the dedicated schedule section
    for (const day of days) {
      const dayPattern = new RegExp(`${day}[:\\s]([\\s\\S]*?)(?=(${days.join('|')}):|$)`, 'i');
      const dayMatch = scheduleSection.match(dayPattern);
      
      if (dayMatch) {
        const dayContent = dayMatch[1].trim();
       const tasks = dayContent.split('\n')
  .filter(Boolean)
  .map(line => {
    const timeMatch = line.match(/(\d+(?::\d+)?(?:\s*(?:am|pm))?)\s*[-:]?\s*(.*)/i);
    return timeMatch ? { time: timeMatch[1], description: timeMatch[2].trim() } : null;
  })
  // ✅ Type guard to remove null and inform TS
  .filter((entry): entry is { time: string; description: string } => entry !== null);

        
        if (tasks.length > 0) {
          weeklyCalendar.push({ day, tasks });
        }
      }
    }
  }
  
  return weeklyCalendar;
}
async extractBundlesAndOffers(message: string): Promise<Bundle[]> {
  const bundles: Bundle[] = [];
  
  const bundlePatterns = [
    /💰\s*BUNDLE\s*RECOMMENDATIONS:[\s\S]*?(?=\d+\.\s*🕐|$)/i,
    /bundle recommendations[\s\S]*?(?=\n\n|$)/i,
    /smart pricing[\s\S]*?(?=\n\n|$)/i,
    /bundle deals[\s\S]*?(?=\n\n|$)/i
  ];
  
  let bundleSection = "";
  for (const pattern of bundlePatterns) {
    const match = message.match(pattern);
    if (match) {
      bundleSection = match[0];
      break;
    }
  }
  
  if (bundleSection) {
    const bundleRegex = /"([^"]+)".*?[Bb]undle[:\s](.*?)(?:[Rr]egular|\$)(.*)/g;
    const bundleMatches = bundleSection.matchAll(bundleRegex);
    
    for (const match of Array.from(bundleMatches)) {
      const name = match[1]?.trim();
      const itemsText = match[2]?.trim();
      const priceInfo = match[3]?.trim();
      
      if (!name || !priceInfo) continue;
      
      const items = itemsText.split(/[+,]/).map(item => item.trim()).filter(Boolean);
      
      const priceMatch = priceInfo.match(/\$([\d.]+).*?\$([\d.]+).*?(\d+(?:\.\d+)?)%/);
      
      if (priceMatch) {
        bundles.push({
          name,
          items,
          regularPrice: parseFloat(priceMatch[1]),
          bundlePrice: parseFloat(priceMatch[2]),
          discount: `${priceMatch[3]}%`
        });
      } else {
        const simplePrice = priceInfo.match(/\$([\d.]+)/g);
        if (simplePrice && simplePrice.length >= 2) {
          const regularPrice = parseFloat(simplePrice[0].replace('$', ''));
          const bundlePrice = parseFloat(simplePrice[1].replace('$', ''));
          const discountPercent = ((regularPrice - bundlePrice) / regularPrice * 100).toFixed(1);
          
          bundles.push({
            name,
            items,
            regularPrice,
            bundlePrice,
            discount: `${discountPercent}%`
          });
        }
      }
    }
  }
  
  const comboPatterns = [
    /"([^"]+)".*?with\s*(.*?)\s*for\s*\$([\d.]+)/ig,
    /([A-Za-z\s]+)\s*combo.*?includes\s*(.*?)\s*for\s*\$([\d.]+)/ig,
    /([A-Za-z\s]+)\s*set.*?includes\s*(.*?)\s*at\s*\$([\d.]+)/ig
  ];
  
  for (const pattern of comboPatterns) {
    const matches = message.matchAll(pattern);
    
    for (const match of Array.from(matches)) {
      const name = match[1]?.trim();
      const itemsText = match[2]?.trim();
      const price = parseFloat(match[3]);
      
      if (!name || !itemsText || isNaN(price)) continue;
      
      const items = itemsText.split(/[+,]/).map(item => item.trim()).filter(Boolean);
      
      const surroundingText = message.substring(
        Math.max(0, message.indexOf(match[0]) - 50),
        Math.min(message.length, message.indexOf(match[0]) + match[0].length + 50)
      );
      
      const regularPriceMatch = surroundingText.match(/[Rr]egular(?:ly|price)?\s*(?:at|is|for)?\s*\$([\d.]+)/);
      const regularPrice = regularPriceMatch 
        ? parseFloat(regularPriceMatch[1]) 
        : price * 1.15;
      
      const discountPercent = ((regularPrice - price) / regularPrice * 100).toFixed(1);
      
      bundles.push({
        name,
        items,
        regularPrice: parseFloat(regularPrice.toFixed(2)),
        bundlePrice: price,
        discount: `~${discountPercent}%`
      });
    }
  }
  
  return bundles;
}

// Generic approach to extract baking/inventory plan without hardcoding product names
async extractBakingPlan(message: string): Promise<BakingItem[]> {
  const bakingPlan: BakingItem[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
               'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
  
  // Try multiple patterns to find inventory information
  const inventoryPatterns = [
    /📦\s*INVENTORY\s*PLANNING:[\s\S]*?(?=\d+\.\s*📆|$)/i,
    /INVENTORY\s*(?:PLANNING|TIPS)[\s\S]*?(?=\n\n|$)/i,
    /inventory\s*levels[\s\S]*?(?=\n\n|$)/i,
    /inventory\s*tips[\s\S]*?(?=\n\n|$)/i
  ];
  
  let inventorySection = "";
  for (const pattern of inventoryPatterns) {
    const match = message.match(pattern);
    if (match) {
      inventorySection = match[0];
      break;
    }
  }
  
  if (inventorySection) {
    // Look for day patterns and extract product quantities
    for (const day of days) {
      const dayPattern = new RegExp(`${day}[s]?:([^\\n]*?)(?=\\n|$)`, 'i');
      const dayMatch = inventorySection.match(dayPattern);
      
      if (dayMatch) {
  const dayInfo = dayMatch[1].trim();

  // explicitly type products so TS knows what it holds
  const products: { name: string; quantity: number }[] = [];
  
  const quantities = dayInfo.match(/\d+\s*[A-Za-zÀ-ÿ\u0600-\u06FF\s]+?(?=,|\d|$)/g) || [];
  
  for (const quantityProduct of quantities) {
    const parts = quantityProduct.match(/(\d+)\s*(.*)/);
    if (parts) {
      const quantity = parseInt(parts[1], 10);
      const name = parts[2].trim().replace(/,$/, '');
      
      if (name && !isNaN(quantity)) {
        products.push({ name, quantity });  // now works!
      }
    }
  }
  
  if (products.length > 0) {
    bakingPlan.push({ day, products });
  }
}

    }
  }
  
  // If we couldn't find an inventory section, look for inventory mentions elsewhere
  if (bakingPlan.length === 0) {
    // Look for patterns like "On {day}, prepare X items of Y"
    for (const day of days) {
      const dayPattern = new RegExp(`[Oo]n\\s*${day}[s]?[,:]?\\s*(?:prepare|have|stock|make)\\s*([^\\n]*?)(?=\\n|$)`, 'i');
      const dayMatch = message.match(dayPattern);
      const products: { name: string; quantity: number }[] = [];

    }
  }
  
  return bakingPlan;
}

// Generic approach to extract time of day strategy without hardcoding product names
async extractTimeDayStrategy(message: string): Promise<TimeStrategy[]> {
  const timeStrategy: TimeStrategy[] = [];
  const timeOfDayKeywords = ['morning', 'afternoon', 'evening', 'night', 'breakfast', 'lunch', 'dinner'];
  
  // Try multiple patterns to find time targeting information
  const timePatterns = [
    /📍\s*TIME\s*TARGETING:[\s\S]*?(?=\d+\.\s*📉|$|\n\n)/i,
    /TIME\s*TARGETING[\s\S]*?(?=\n\n|$)/i,
    /time\s*strategy[\s\S]*?(?=\n\n|$)/i,
    /timing[\s\S]*?strategy[\s\S]*?(?=\n\n|$)/i
  ];
  
  let timeSection = "";
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      timeSection = match[0];
      break;
    }
  }
  
  // Process time targeting strategies from a dedicated section if found
  if (timeSection) {
    const lines = timeSection.split('\n').filter(line => 
      timeOfDayKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );
    
    for (const line of lines) {
      // Determine time of day
      let timeOfDay = '';
      for (const keyword of timeOfDayKeywords) {
        if (line.toLowerCase().includes(keyword)) {
          timeOfDay = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }
      
      if (!timeOfDay) continue;
      
      // Extract product and strategy
      // Find any word before "sales", "promotion", or after "promote", "push", "feature"
      const productMatch = line.match(/(?:push|promote|feature)\s*([A-Za-zÀ-ÿ\u0600-\u06FF\s]+?)(?:\s+in|\s+as|\s+for|$)/i) || 
                          line.match(/([A-Za-zÀ-ÿ\u0600-\u06FF\s]+?)\s+(?:sales|items|products|promotion)/i);
      
      if (productMatch) {
        const product = productMatch[1].trim();
        timeStrategy.push({
          timeOfDay,
          product,
          strategy: line.replace(/^[-•*]\s*/, '').trim()
        });
      } else {
        // If we can't identify a specific product, still capture the strategy
        timeStrategy.push({
          timeOfDay,
          product: "All products",
          strategy: line.replace(/^[-•*]\s*/, '').trim()
        });
      }
    }
  }
  
  // If no strategies found in a dedicated section, look throughout the message
  if (timeStrategy.length === 0) {
    const allLines = message.split('\n');
    
    for (const line of allLines) {
      // Check if line contains a time of day keyword
      const timeKeyword = timeOfDayKeywords.find(keyword => line.toLowerCase().includes(keyword));
      
      if (!timeKeyword) continue;
      
      // Extract product and strategy similarly to above
      const productMatch = line.match(/(?:push|promote|feature)\s*([A-Za-zÀ-ÿ\u0600-\u06FF\s]+?)(?:\s+in|\s+as|\s+for|$)/i) || 
                          line.match(/([A-Za-zÀ-ÿ\u0600-\u06FF\s]+?)\s+(?:sales|items|products|promotion)/i);
      
      if (productMatch) {
        const product = productMatch[1].trim();
        const timeOfDay = timeKeyword.charAt(0).toUpperCase() + timeKeyword.slice(1);
        
        timeStrategy.push({
          timeOfDay,
          product,
          strategy: line.replace(/^[-•*]\s*/, '').trim()
        });
      }
    }
  }
  
  return timeStrategy;
}

    async createProfit(data: {
        amount: number;
        invoiceId?: string;
        productId?: string;
        day?:string;
      },userId:string) {
        return this.prisma.profit.create({
          data: {
            amount: data.amount,
            userId: userId,
            invoiceId: data.invoiceId,
            productId: data.productId,
            day:data.day
          },
        });
      }
      async deleteProfitByInvoiceId(invoiceId: string): Promise<{ count: number }> {
  return this.prisma.profit.deleteMany({
    where: { invoiceId },
  });
}

      

      async getTodayTotalProfit(userId: string): Promise<number> {
        const start = startOfDay(new Date());
        const end = endOfDay(new Date());
      
        const profits = await this.prisma.profit.findMany({
          where: {
            userId,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });
      
        return profits.reduce((sum, p) => sum + p.amount, 0);
      }
      
      async getMonthTotalProfit(userId: string): Promise<number> {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
      
        const profits = await this.prisma.profit.findMany({
          where: {
            userId,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });
      
        return profits.reduce((sum, p) => sum + p.amount, 0);
      }
      
      async getYearTotalProfit(userId: string): Promise<number> {
        const start = startOfYear(new Date());
        const end = endOfYear(new Date());
      
        const profits = await this.prisma.profit.findMany({
          where: {
            userId,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });
      
        return profits.reduce((sum, p) => sum + p.amount, 0);
      }
      
      async getAllTimeTotalProfit(userId: string): Promise<number> {
        const profits = await this.prisma.profit.findMany({
          where: { userId },
        });
      
        return profits.reduce((sum, p) => sum + p.amount, 0);
      }
      
      async getProfitSummary(userId: string): Promise<{
        today: number;
        month: number;
        year: number;
        allTime: number;
      }> {
        const [today, month, year, allTime] = await Promise.all([
          this.getTodayTotalProfit(userId),
          this.getMonthTotalProfit(userId),
          this.getYearTotalProfit(userId),
          this.getAllTimeTotalProfit(userId),
        ]);
      
        return { today, month, year, allTime };
      }
      
      async updateProfitAmount(profitId: string, newAmount: number): Promise<void> {
    await this.prisma.profit.update({
      where: { id: profitId },
      data: { amount: newAmount },
    });
  }
  async hasProfitToday(userId: string): Promise<boolean> {
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());

  const profit = await this.prisma.profit.findFirst({
    where: {
      userId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  return !!profit; // true if found, false if not
}

}
