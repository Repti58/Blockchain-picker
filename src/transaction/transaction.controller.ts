import { Controller, Get } from "@nestjs/common";
import { TransactionService } from "./transaction.service";

@Controller("api")
export class TransactionController {
    constructor(private readonly appService: TransactionService) {}

    @Get("maxchange")
    getMaxChange() {
        return this.appService.getMaxChange();
    }
}
