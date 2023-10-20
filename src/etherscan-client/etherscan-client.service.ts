import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Cron } from '@nestjs/schedule';
import { Decimal, DefaultArgs } from '@prisma/client/runtime/library';
import { START_BLOCK } from './../config';
import { Prisma } from '@prisma/client';

@Injectable()
export class EtherscanClientService {
    startBlock: number;
    constructor(private prisma: PrismaService) {
        this.startBlock = parseInt(START_BLOCK ?? '17583000');
    }
    private readonly logger = new Logger(EtherscanClientService.name);

    create(transactions: []) {
        return this.prisma.transactions.createMany({ data: transactions });
    }

    getLastRecord(): Prisma.Prisma__TransactionsClient<
        {
            id: number;
            blockNumber: number;
            from: string;
            to: string;
            value: Decimal;
        },
        null,
        DefaultArgs
    > {
        const lastRecord = this.prisma.transactions.findFirst({
            orderBy: {
                id: 'desc',
            },
        });
        return lastRecord;
    }

    async getLastBlockNumber(): Promise<string> {
        try {
            const response = await fetch(
                'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber',
            );
            return (await response.json()).result;
        } catch (error) {
            this.logger.error(error);  
        }
    }

    async getUri(lastRecord: {
        id: number;
        blockNumber: number;
        from: string;
        to: string;
        value: Decimal;
    }): Promise<string> {
        let block: string;
        if (!lastRecord) {
            block = this.startBlock.toString(16);
        } else {
            const lastBlockInList = +lastRecord.blockNumber;
            if (
                parseInt(await this.getLastBlockNumber(), 16) ===
                lastBlockInList
            ) {
                this.logger.verbose('last block reached');
                return;
            }
            block = (lastBlockInList + 1).toString(16);
        }
        const Uri = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x${block}&boolean=true`;
        return Uri;
    }

    async getBlock(): Promise<Prisma.BatchPayload> {
        try {
            const lastRecord = await this.getLastRecord();
            let requestURI = await this.getUri(lastRecord);

            await new Promise((resolve) => setTimeout(resolve, 5000));
            const response = await fetch(requestURI);

            if (!response.ok) {
                throw new Error('Fetch error');
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
                },
            );
            return this.create(transactionsData);
        } catch (error) {
            this.logger.error(error);
        }
    }

    @Cron('0 * * * * *')
    handleCron() {
        this.logger.verbose('Running a task every minute');
        this.getBlock();
    }
}
