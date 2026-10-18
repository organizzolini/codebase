import { Module } from "@nestjs/common";

import { ProcessRunnerService } from "./process-runner.service";

/** Provides the one wrapper every integration command runs child processes through. */
@Module({
  controllers: [],
  exports: [ProcessRunnerService],
  imports: [],
  providers: [ProcessRunnerService],
})
export class ProcessRunnerModule {}
