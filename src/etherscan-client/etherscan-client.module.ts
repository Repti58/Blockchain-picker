import { Module } from "@nestjs/common";
import { EtherscanClientService } from "./etherscan-client.service";
import { PrismaService } from "src/prisma.service";

@Module({
    controllers: [],
    providers: [PrismaService, EtherscanClientService],
})
export class EtherscanClientModule {}
