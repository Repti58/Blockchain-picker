import { Module } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { PrismaService } from "src/prisma.service";

@Module({
    controllers: [],
    providers: [PrismaService, TransactionService],
})
export class TransactionsModule {}
