import { SaleDigitalService } from './sale-digital.service';
import { Controller, Post, Body, Patch, Param, UseGuards, Request, Get, Query, Delete, BadRequestException } from '@nestjs/common';
import { CreateSaleDigitalDto } from './dto/create-sale.dto';
import { UpdateSaleDigitalDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
type PeriodType = 'day' | 'month' | 'year';
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
@Controller('sale-digital')
export class SaleDigitalController {
      constructor(private readonly saleDigitalService: SaleDigitalService) {}



        @Post()
        create(@Body() createSaleDto: CreateSaleDigitalDto, @Request() req) {
          const userId = req.user.sub;
          return this.saleDigitalService.create(createSaleDto, userId);
        }
       
      
        @Post('batch')
      createMany(@Body() sales: CreateSaleDigitalDto[], @Request() req) {
        const userId = req.user.sub;
        return this.saleDigitalService.createMany(sales, userId);
      }
        @Patch(':id')
        update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDigitalDto, @Request() req) {
          const userId = req.user.sub;
          return this.saleDigitalService.update(id, updateSaleDto, userId);
        }
      
        @Get()
      findAll(@Request() req) {
        const userId = req.user.sub;
        return this.saleDigitalService.findAllByUser(userId);
      }
      @Get('todayTotal')
      findtoday(@Request() req) {
        const userId = req.user.sub;
        return this.saleDigitalService.getTodayTotal(userId);
      
      }
          @UseGuards(JwtAuthGuard)
      @Get('stats')
      getstats(@Request() req) {
        const userId = req.user.sub;
        return this.saleDigitalService.getSalesSummary(userId);
      
      
      
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
      
        return this.saleDigitalService.getBestProjectByPeriod(userId, period, dateObject);
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
        return this.saleDigitalService.getSalesSummaryByPeriod(userId, period, dateObject);
      }
      
      @UseGuards(JwtAuthGuard)
      @Get('Allstats')
      getAllstats(@Request() req) {
        const userId = req.user.sub;
        return this.saleDigitalService.getFullSummary(userId);
      
      }
      
      
      @UseGuards(JwtAuthGuard)
      @Get('Avreage')
      getsalesAvreage(@Request() req) {
        const userId = req.user.sub;
        return this.saleDigitalService.getTodayAverageInvoiceValue(userId);
      
      }
      
      
      
      @UseGuards(JwtAuthGuard)
      @Get('by-period')
      getSalesbyperiod(@Request() req,
      @Query('period') period: 'day' | 'month' | 'year', 
      @Query('date') date: string) {
        const userId = req.user.sub;
        const dateObject = new Date(date); // Convert date string to Date object
      
        return this.saleDigitalService.getSalesByPeriod(userId, period, dateObject);
      
      }
      
      
      
      
      
      
      
    @Delete('invoice/:invoiceId')
  async deleteProfitByInvoiceId(@Param('invoiceId') invoiceId: string) {
    const result = await this.saleDigitalService.deleteSaleByInvoiceId(invoiceId);
    return {
      message: `${result.count} profit record(s) deleted for invoice ${invoiceId}`,
    };
  }

  

    @UseGuards(JwtAuthGuard)
  @Get('compare-periods')
  async getSalesComparison(
    @Request() req,
    @Query('period') period: PeriodType,
    @Query('dateA') dateA: string,
    @Query('dateB') dateB: string,
  ): Promise<ComparisonResult> {                  // ← explicitly name the return type
    const userId = req.user.sub;
    const dateObjA = new Date(dateA);
    const dateObjB = new Date(dateB);

    if (isNaN(dateObjA.getTime()) || isNaN(dateObjB.getTime())) {
      throw new BadRequestException('Invalid date format for dateA or dateB');
    }

    return await this.saleDigitalService.getSalesComparison(
      userId,
      period,
      dateObjA,
      dateObjB,
    );
  }
}