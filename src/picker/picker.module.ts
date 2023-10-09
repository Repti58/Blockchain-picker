import { Module } from '@nestjs/common';
import { PickerService } from './picker.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [],
  providers: [PrismaService, PickerService],
})
export class PickerModule {}
