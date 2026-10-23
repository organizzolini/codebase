import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { CleanupCodebaseCommand } from "./cleanup-codebase.command";

/** Provides the command that tidies a CI job's Nx task database. */
@Module({
  controllers: [],
  exports: [CleanupCodebaseCommand],
  imports: [LoggerModule, TaskDatabaseModule],
  providers: [CleanupCodebaseCommand],
})
export class CleanupCodebaseModule {}
