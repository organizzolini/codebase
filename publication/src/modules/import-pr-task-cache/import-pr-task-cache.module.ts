import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { TaskDatabaseModule } from "../task-database/task-database.module";

import { ImportPrTaskCacheCommand } from "./import-pr-task-cache.command";
import { ImportPrTaskCacheService } from "./import-pr-task-cache.service";

/** Provides the command that imports a pull request's Nx cache into its merge group. */
@Module({
  controllers: [],
  exports: [ImportPrTaskCacheCommand, ImportPrTaskCacheService],
  imports: [LoggerModule, ProcessRunnerModule, TaskDatabaseModule],
  providers: [ImportPrTaskCacheCommand, ImportPrTaskCacheService],
})
export class ImportPrTaskCacheModule {}
