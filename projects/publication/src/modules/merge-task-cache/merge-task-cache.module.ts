import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { MergeTaskCacheCommand } from "./merge-task-cache.command";

/** Provides the command that merges another run's Nx task cache into this one. */
@Module({
  controllers: [],
  exports: [MergeTaskCacheCommand],
  imports: [LoggerModule, TaskDatabaseModule],
  providers: [MergeTaskCacheCommand],
})
export class MergeTaskCacheModule {}
