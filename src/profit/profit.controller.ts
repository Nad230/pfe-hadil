import { Body, Controller, Delete, Get, Param, Post,Patch, Request, UseGuards } from '@nestjs/common';
import { ProfitService } from './profit.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface StructuredAdvice {
  weeklyCalendar: DailyTask[];
  bundlesAndOffers: Bundle[];
  bakingPlan: BakingItem[];
  timeDayStrategy: TimeStrategy[];
  originalAdvice: any; // Keep the original data for reference
}

interface DailyTask {
  day: string;
  tasks: {
    time: string;
    description: string;
  }[];
}

interface Bundle {
  name: string;
  items: string[];
  regularPrice: number;
  bundlePrice: number;
  discount: string;
}

interface BakingItem {
  day: string;
  products: {
    name: string;
    quantity: number;
  }[];
}

interface TimeStrategy {
  timeOfDay: string;
  product: string;
  strategy: string;
}
@Controller('aiadvice')
export class ProfitController {


    constructor(private readonly profitService: ProfitService) {}


    

     @UseGuards(JwtAuthGuard)
    @Get('/digital')
getdigitaladvice(@Request() req) {
  const userId = req.user.sub;
  return this.profitService.getDigitalAdviceai(userId);

}

    @UseGuards(JwtAuthGuard)
@Get('aisales-advice')
async getadviceai(
  @Request() req,
): Promise<StructuredAdvice[]> {
  return this.profitService.getStructuredAdviceByUser(req.user.sub);
}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createProfit(
        @Request()req,
      @Body() body: { amount: number;  invoiceId?: string; productId?: string;day?:string }
    ) {
      return this.profitService.createProfit(body,req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats')
getstats(@Request() req) {
  const userId = req.user.sub;
  return this.profitService.getProfitSummary(userId);


}
    @UseGuards(JwtAuthGuard)

@Get('has-profit-today')
async checkHasProfitToday(@Request() req) {
    const userId = req.user.sub;

  const exists = await this.profitService.hasProfitToday(userId);
  return {
    hasProfitToday: exists,
    message: exists ? 'There is a profit recorded today.' : 'No profit recorded today.',
  };
}

 @Patch(':id/amount')
  async updateProfitAmount(
    @Param('id') profitId: string,
    @Body('amount') newAmount: number,
  ): Promise<{ message: string }> {
    await this.profitService.updateProfitAmount(profitId, newAmount);
    return { message: 'Profit amount updated successfully' };
  }
@Delete('invoice/:invoiceId')
  async deleteProfitByInvoiceId(@Param('invoiceId') invoiceId: string) {
    const result = await this.profitService.deleteProfitByInvoiceId(invoiceId);
    return {
      message: `${result.count} profit record(s) deleted for invoice ${invoiceId}`,
    };
  }
}


