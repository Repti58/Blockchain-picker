import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiModule } from './api/api.module';
import { PickerModule } from './picker/picker.module';

@Module({
  imports: [ScheduleModule.forRoot(), ApiModule, PickerModule],
  providers: [PrismaService],
})
export class AppModule {}
