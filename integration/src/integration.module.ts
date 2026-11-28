import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./integration.constants";
import { BoundBaseToPushModule } from "./modules/bound-base-to-push/bound-base-to-push.module";
import { CleanupCodebaseModule } from "./modules/cleanup-codebase/cleanup-codebase.module";
import { CollectCodometerBaselineModule } from "./modules/collect-codometer-baseline/collect-codometer-baseline.module";
import { ImportPrTaskCacheModule } from "./modules/import-pr-task-cache/import-pr-task-cache.module";
import { ReportCodometerChangesModule } from "./modules/report-codometer-changes/report-codometer-changes.module";
import { RunAffectedModule } from "./modules/run-affected/run-affected.module";
import { SetupCodebaseModule } from "./modules/setup-codebase/setup-codebase.module";
import { SynchronizationModule } from "./modules/synchronization/synchronization.module";
import { AdoptTaskDatabaseModule } from "./modules/task-database/modules/adopt-task-database/adopt-task-database.module";
import { KeepTaskDatabaseModule } from "./modules/task-database/modules/keep-task-database/keep-task-database.module";
import { MergeTaskCacheModule } from "./modules/task-database/modules/merge-task-cache/merge-task-cache.module";
import { VerifyTaskDatabaseModule } from "./modules/task-database/modules/verify-task-database/verify-task-database.module";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    AdoptTaskDatabaseModule,
    BoundBaseToPushModule,
    CleanupCodebaseModule,
    CollectCodometerBaselineModule,
    ConfigModule.forRoot({
      envFilePath: "configuration/.env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    DiscoveryModule,
    ImportPrTaskCacheModule,
    KeepTaskDatabaseModule,
    LoggerModule,
    MergeTaskCacheModule,
    ReportCodometerChangesModule,
    RunAffectedModule,
    SetupCodebaseModule,
    SynchronizationModule,
    VerifyTaskDatabaseModule,
  ],
})
export class MainModule {}
