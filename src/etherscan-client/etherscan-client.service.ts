import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { Cron } from "@nestjs/schedule";
import { Decimal } from "@prisma/client/runtime/library";

const START_BLOCK = parseInt(process.env.START_BLOCK ?? "17583000");

@Injectable()
export class EtherscanClientService {
    constructor(private prisma: PrismaService) {}
    private readonly logger = new Logger(EtherscanClientService.name);

    create(transactions: []) {
        return this.prisma.transactions.createMany({ data: transactions });
    }

    getLastRecord() {
        const lastRecord = this.prisma.transactions.findFirst({
            orderBy: {
                id: "desc",
            },
        });
        return lastRecord;
    }

    async getLastBlockNumber() {
        try {
            const response = await fetch(
                "https://api.etherscan.io/api?module=proxy&action=eth_blockNumber"
            );
            const lastBlockNumber = (await response.json()).result;
            return lastBlockNumber;
        } catch (error) {
            console.error(error);
        }
    }

    async getUri(lastRecord: {
        id: number;
        blockNumber: number;
        from: string;
        to: string;
        value: Decimal;
    }) {
        let Uri: string;
        if (!lastRecord) {
            const block = START_BLOCK.toString(16);
            Uri = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x${block}&boolean=true`;
        } else {
            const lastBlockInList = +lastRecord.blockNumber;
            if (
                parseInt(await this.getLastBlockNumber(), 16) ===
                lastBlockInList
            ) {
                this.logger.verbose("last block reached");
                return;
            }
            const nextBlock = (lastBlockInList + 1).toString(16);
            Uri = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x${nextBlock}&boolean=true`;
        }
        return Uri;
    }

    async getBlock() {
        try {
            const lastRecord = await this.getLastRecord();
            let requestURI = await this.getUri(lastRecord);

            await new Promise((resolve) => setTimeout(resolve, 5000));
            const response = await fetch(requestURI);

            if (!response.ok) {
                throw new Error("Fetch error");
            }

            const blockData = await response.json();

            if (blockData.error) {
                throw new Error(blockData.error);
            }

            const transactions = blockData.result.transactions;

            const transactionsData = transactions.map(
                (item: {
                    blockNumber: string;
                    from: string;
                    to: string;
                    value: string;
                }) => {
                    const { blockNumber, from, to, value } = item;
                    return {
                        blockNumber: parseInt(blockNumber, 16),
                        from,
                        to,
                        value: parseInt(value, 16),
                    };
                }
            );
            return this.create(transactionsData);
        } catch (error) {
            console.error(error);
        }
    }

    @Cron("0 * * * * *")
    handleCron() {
        this.logger.verbose("Running a task every minute");
        this.getBlock();
    }
}
