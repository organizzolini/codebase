import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/logging";

import { AdoptTaskDatabaseModule } from "./modules/adopt-task-database/adopt-task-database.module";
import { BoundBaseToPushModule } from "./modules/bound-base-to-push/bound-base-to-push.module";
import { ImportPrTaskCacheModule } from "./modules/import-pr-task-cache/import-pr-task-cache.module";
import { KeepTaskDatabaseModule } from "./modules/keep-task-database/keep-task-database.module";
import { LinkPackagesModule } from "./modules/link-packages/link-packages.module";
import { MergeTaskCacheModule } from "./modules/merge-task-cache/merge-task-cache.module";
import { PublishPackagesModule } from "./modules/publish-packages/publish-packages.module";
import { PublishablePackagesGateModule } from "./modules/publishable-packages-gate/publishable-packages-gate.module";
import { RunAffectedModule } from "./modules/run-affected/run-affected.module";
import { TagCodebaseModule } from "./modules/tag-codebase/tag-codebase.module";
import { TagPackagesModule } from "./modules/tag-packages/tag-packages.module";
import { VerifyTaskDatabaseModule } from "./modules/verify-task-database/verify-task-database.module";
import { VersionPackagesModule } from "./modules/version-packages/version-packages.module";
import { environmentSchema } from "./publication.constants";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    AdoptTaskDatabaseModule,
    BoundBaseToPushModule,
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    DiscoveryModule,
    ImportPrTaskCacheModule,
    KeepTaskDatabaseModule,
    LoggerModule,
    LinkPackagesModule,
    MergeTaskCacheModule,
    PublishPackagesModule,
    PublishablePackagesGateModule,
    RunAffectedModule,
    TagCodebaseModule,
    TagPackagesModule,
    VerifyTaskDatabaseModule,
    VersionPackagesModule,
  ],
})
export class MainModule {}
