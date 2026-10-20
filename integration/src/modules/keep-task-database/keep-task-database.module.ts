import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { KeepTaskDatabaseCommand } from "./keep-task-database.command";

/** Provides the command that keeps the Nx task-result database. */
@Module({
  controllers: [],
  exports: [KeepTaskDatabaseCommand],
  imports: [LoggerModule, TaskDatabaseModule],
  providers: [KeepTaskDatabaseCommand],
})
export class KeepTaskDatabaseModule {}
