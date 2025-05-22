import { Module } from '@nestjs/common';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';
import { AuthModule } from 'src/auth/auth.module';
import { ExpensesService } from 'src/expenses/expenses.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TimeEntryModule } from 'src/time-entry/time-entry.module';

@Module({
  imports: [AuthModule, PrismaModule, TimeEntryModule],
  controllers: [SaleController],
  providers: [SaleService, ExpensesService],
  exports: [SaleService],
})
export class SaleModule {}
