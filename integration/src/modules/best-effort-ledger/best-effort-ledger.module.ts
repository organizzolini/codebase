import { Module } from "@nestjs/common";

import { BestEffortLedgerService } from "./best-effort-ledger.service";

/** Provides the record of best-effort steps that were skipped. */
@Module({
  controllers: [],
  exports: [BestEffortLedgerService],
  imports: [],
  providers: [BestEffortLedgerService],
})
export class BestEffortLedgerModule {}
