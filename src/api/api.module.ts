import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ApiController],
  providers: [PrismaService, ApiService],
})
export class ApiModule {}
