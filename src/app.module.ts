import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ScheduleModule } from "@nestjs/schedule";
import { ApiModule } from "./transaction/transaction.module";
import { EtherscanClientModule } from "./etherscan-client/etherscan-client.module";

@Module({
    imports: [ScheduleModule.forRoot(), ApiModule, EtherscanClientModule],
    providers: [PrismaService],
})
export class AppModule {}
