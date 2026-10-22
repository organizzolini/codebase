import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { BestEffortLedgerModule } from "../best-effort-ledger/best-effort-ledger.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { BestEffortSnapshotService } from "./best-effort-snapshot.service";
import { BestEffortCommand } from "./best-effort.command";
import { BestEffortService } from "./best-effort.service";

/** Provides the command that runs a step without letting it fail the job. */
@Module({
  controllers: [],
  exports: [BestEffortCommand, BestEffortService],
  imports: [BestEffortLedgerModule, LoggerModule, ProcessRunnerModule],
  providers: [BestEffortCommand, BestEffortService, BestEffortSnapshotService],
})
export class BestEffortModule {}
