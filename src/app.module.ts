import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiModule } from './api/api.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [ScheduleModule.forRoot(), ApiModule, TransactionsModule],
  providers: [PrismaService],
})
export class AppModule {}
