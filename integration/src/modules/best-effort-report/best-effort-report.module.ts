import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { BestEffortLedgerModule } from "../best-effort-ledger/best-effort-ledger.module";

import { BestEffortReportCommand } from "./best-effort-report.command";
import { BestEffortReportService } from "./best-effort-report.service";

/** Provides the command that writes up the best-effort steps that were skipped. */
@Module({
  controllers: [],
  exports: [BestEffortReportCommand, BestEffortReportService],
  imports: [BestEffortLedgerModule, LoggerModule],
  providers: [BestEffortReportCommand, BestEffortReportService],
})
export class BestEffortReportModule {}
