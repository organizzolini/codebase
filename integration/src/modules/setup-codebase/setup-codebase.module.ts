import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { BoundBaseToPushModule } from "../bound-base-to-push/bound-base-to-push.module";
import { ImportPrTaskCacheModule } from "../import-pr-task-cache/import-pr-task-cache.module";
import { TaskDatabaseModule } from "../task-database/task-database.module";

import { SetupCodebaseCommand } from "./setup-codebase.command";

/** Provides the command that readies a CI job's Nx base and task cache. */
@Module({
  controllers: [],
  exports: [SetupCodebaseCommand],
  imports: [
    BoundBaseToPushModule,
    ImportPrTaskCacheModule,
    LoggerModule,
    TaskDatabaseModule,
  ],
  providers: [SetupCodebaseCommand],
})
export class SetupCodebaseModule {}
