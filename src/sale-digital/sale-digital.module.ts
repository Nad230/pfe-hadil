import { Module } from '@nestjs/common';
import { SaleDigitalController } from './sale-digital.controller';
import { SaleDigitalService } from './sale-digital.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ProfitService } from 'src/profit/profit.service';

@Module({
  controllers: [SaleDigitalController],
  providers: [SaleDigitalService,ExpensesService,ProfitService,],
    imports: [AuthModule,PrismaModule], 
    exports: [SaleDigitalService],
  
})
export class SaleDigitalModule {}
