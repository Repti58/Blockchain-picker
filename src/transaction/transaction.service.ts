import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {RANGE} from "./../config"

@Injectable()
export class TransactionService {
    range: number
    constructor(private prisma: PrismaService) {
        this.range = parseInt(RANGE ?? "100")
    }
    async getMaxChange() {
        try {
            let result: [{ adress: string; total_balance_change: string }] =
                await this.prisma.$queryRaw`
                SELECT "address", SUM("balance_change") / POWER(10, 18) AS "total_balance_change"
                FROM (
                    SELECT "to" AS "address", SUM("value") AS "balance_change"
                    FROM "Transactions"
                    WHERE "blockNumber" > (
                        SELECT MAX("blockNumber") - ${this.range}
                        FROM "Transactions"
                    )
                    GROUP BY "to"
        
                    UNION ALL
        
                    SELECT "from" AS "address", SUM(-"value") AS "balance_change"
                    FROM "Transactions"
                    WHERE "blockNumber" > (
                        SELECT MAX("blockNumber") - ${this.range}
                        FROM "Transactions"
                    )
                    GROUP BY "from"
                ) AS "balance_changes"
                GROUP BY "address"
                ORDER BY "total_balance_change" DESC 
                LIMIT 1
            `;
            return result;
        } catch (error) {
            console.error("SQL request error", error);
        }
    }
}
