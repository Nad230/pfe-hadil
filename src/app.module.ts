import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ProjectModule } from './project/project.module';
import { TimeEntryModule } from './time-entry/time-entry.module';
import { AiController } from './ai/ai.controller';
import { AIModule } from './ai/ai.module';
import { TeamModule } from './team/team.module';
import { TranslateModule } from './translation/translation.module';
import { MilestoneModule } from './milestone/milestone.module';
import { TaskModule } from './task/task.module';

import { ScheduleModule } from '@nestjs/schedule';

import { ProductModule } from './product/product.module';
import { SaleModule } from './sale/sale.module';
/*import { ExpenseModule } from './expense/expense.module';*/
import { TransactionsModule } from './transactions/transactions.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ProjectOfflineAiModule } from './project-offline-ai/project-offline-ai.module';
import { UserlocationModule } from './userlocation/userlocation.module';
import { BusinessPlanModule } from './business-plan/business-plan.module';
import { ClientModule } from './client/client.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ProfitModule } from './profit/profit.module';
import { SaleDigitalModule } from './sale-digital/sale-digital.module';
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from './notification/notification.module';
import { MailModule } from './mail/mail.module';


@Module({
  imports: [AuthModule, PrismaModule, SupabaseModule, ProjectModule, AIModule, TeamModule, TranslateModule, MilestoneModule, TaskModule, TimeEntryModule,  ScheduleModule.forRoot(), ProductModule, SaleModule, TransactionsModule, ExpensesModule, ProjectOfflineAiModule, UserlocationModule, BusinessPlanModule, ClientModule, InvoiceModule, ProfitModule, SaleDigitalModule, NotificationModule, MailModule /*ExpenseModule*//*SocialMediaCronModule*/],
  controllers: [AiController],
})
export class AppModule {}
