import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { AdoptTaskDatabaseCommand } from "./adopt-task-database.command";

/** Provides the command that adopts the Nx task-result database. */
@Module({
  controllers: [],
  exports: [AdoptTaskDatabaseCommand],
  imports: [LoggerModule, TaskDatabaseModule],
  providers: [AdoptTaskDatabaseCommand],
})
export class AdoptTaskDatabaseModule {}
