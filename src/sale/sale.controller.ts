import { Controller, Post, Body, Patch, Param, UseGuards, Request, Get, Query, BadRequestException } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateDailyProfitDto } from './dto/create-daily-profit.dto';
type PeriodType = 'day' | 'month' | 'year';
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
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    const userId = req.user.sub;
    return this.saleService.create(createSaleDto, userId);
  }
  @Post('profit')
  createProfit(@Body() createSaleDto: CreateDailyProfitDto, @Request() req) {
    const userId = req.user.sub;
    return this.saleService.createProfit(createSaleDto, userId);
  }

  @Post('batch')
createMany(@Body() sales: CreateSaleDto[], @Request() req) {
  const userId = req.user.sub;
  return this.saleService.createMany(sales, userId);
}
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto, @Request() req) {
    const userId = req.user.sub;
    return this.saleService.update(id, updateSaleDto, userId);
  }

  @Get()
findAll(@Request() req) {
  const userId = req.user.sub;
  return this.saleService.findAllByUser(userId);
}
@Get('todayTotal')
findtoday(@Request() req) {
  const userId = req.user.sub;
  return this.saleService.getTodayTotal(userId);

}
    @UseGuards(JwtAuthGuard)
@Get('stats')
getstats(@Request() req) {
  const userId = req.user.sub;
  return this.saleService.getSalesSummary(userId);



}



@UseGuards(JwtAuthGuard)
@Get('best-product')
getBestProduct(
  @Request() req,
  @Query('period') period: 'day' | 'month' | 'year',
  @Query('date') date: string
) {
  const userId = req.user.sub;
  const dateObject = new Date(date);

  return this.saleService.getBestSellingProductByPeriod(userId, period, dateObject);
}


 @UseGuards(JwtAuthGuard)
@Get('profit-summary')
getProfitSummary(
  @Request() req,
  @Query('period') period: 'day' | 'month' | 'year',
  @Query('date') date: string
) {
  const userId = req.user.sub;
  const dateObject = new Date(date);
  return this.saleService.getProfitSummaryByPeriod(userId, period, dateObject);
}


@UseGuards(JwtAuthGuard)
@Get('summary')
getSalesSummary(
  @Request() req,
  @Query('period') period: 'day' | 'month' | 'year',
  @Query('date') date: string
) {
  const userId = req.user.sub;
  const dateObject = new Date(date);
  return this.saleService.getSalesSummaryByPeriod(userId, period, dateObject);
}

@UseGuards(JwtAuthGuard)
@Get('Allstats')
getAllstats(@Request() req) {
  const userId = req.user.sub;
  return this.saleService.getFullSummary(userId);

}


@UseGuards(JwtAuthGuard)
@Get('Avreage')
getsalesAvreage(@Request() req) {
  const userId = req.user.sub;
  return this.saleService.getTodayAverageOrderValue(userId);

}



@UseGuards(JwtAuthGuard)
@Get('by-period')
getSalesbyperiod(@Request() req,
@Query('period') period: 'day' | 'month' | 'year', 
@Query('date') date: string) {
  const userId = req.user.sub;
  const dateObject = new Date(date); // Convert date string to Date object

  return this.saleService.getSalesByPeriod(userId, period, dateObject);

}



@UseGuards(JwtAuthGuard)
@Get('TodaycountOrder')
getsalestodaycount(@Request() req) {
  const userId = req.user.sub;
  return this.saleService.getTodayOrderCount(userId);

}





@UseGuards(JwtAuthGuard)
  @Get('compare-periods')
 async getSalesComparison(
    @Request() req,
    @Query('period') period: PeriodType,
    @Query('dateA') dateA: string,
    @Query('dateB') dateB: string,
  ): Promise<SalesComparisonResult> {
    const userId = req.user.sub;
    const dateObjA = new Date(dateA);
    const dateObjB = new Date(dateB);

    if (isNaN(dateObjA.getTime()) || isNaN(dateObjB.getTime())) {
      throw new BadRequestException('Invalid date format for dateA or dateB');
    }

    return await this.saleService.getSalesComparison(
      userId,
      period,
      dateObjA,
      dateObjB,
    );
  }


  @UseGuards(JwtAuthGuard)
  @Get('profit/compare-periods')
  async getProfitComparison(
    @Request() req,
    @Query('period') period: PeriodType,
    @Query('dateA') dateA: string,
    @Query('dateB') dateB: string,
  ): Promise<ReturnType<typeof this.saleService.getProfitComparison>> {
    const userId = req.user.sub;

    const dateObjA = new Date(dateA);
    const dateObjB = new Date(dateB);

    if (isNaN(dateObjA.getTime()) || isNaN(dateObjB.getTime())) {
      throw new BadRequestException('Invalid date format for dateA or dateB');
    }

    return this.saleService.getProfitComparison(userId, period, dateObjA, dateObjB);
  }
}




