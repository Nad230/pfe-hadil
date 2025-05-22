import { Module } from '@nestjs/common';
import { ProfitService } from './profit.service';
import { ProfitController } from './profit.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SaleDigitalService } from 'src/sale-digital/sale-digital.service';
import { ExpensesService } from 'src/expenses/expenses.service';
import { SaleService } from 'src/sale/sale.service';

@Module({
  providers: [ProfitService,SaleDigitalService,ExpensesService],
  controllers: [ProfitController],
        imports: [AuthModule,PrismaModule], 
  exports:[ProfitService]
})
export class ProfitModule {}
