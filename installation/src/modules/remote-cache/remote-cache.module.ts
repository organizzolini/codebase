import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { RemoteCacheCommand } from "./remote-cache.command";
import { RemoteCacheService } from "./remote-cache.service";

/** Provides the command that creates this machine's read-only key to the shared Nx cache bucket. */
@Module({
  controllers: [],
  exports: [RemoteCacheCommand, RemoteCacheService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [RemoteCacheCommand, RemoteCacheService],
})
export class RemoteCacheModule {}
