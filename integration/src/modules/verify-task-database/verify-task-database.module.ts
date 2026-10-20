import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { VerifyTaskDatabaseCommand } from "./verify-task-database.command";

/** Provides the command that checks the Nx task-result database. */
@Module({
  controllers: [],
  exports: [VerifyTaskDatabaseCommand],
  imports: [LoggerModule, TaskDatabaseModule],
  providers: [VerifyTaskDatabaseCommand],
})
export class VerifyTaskDatabaseModule {}
