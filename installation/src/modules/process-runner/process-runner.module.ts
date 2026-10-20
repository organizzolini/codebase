import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerService } from "./process-runner.service";

/**
 * Provides the one place this project starts child processes, so every setup
 * step can be run against a faked machine in a test.
 */
@Module({
  controllers: [],
  exports: [ProcessRunnerService],
  imports: [LoggerModule],
  providers: [ProcessRunnerService],
})
export class ProcessRunnerModule {}
