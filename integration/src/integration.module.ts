import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./integration.constants";
import { AdoptTaskDatabaseModule } from "./modules/adopt-task-database/adopt-task-database.module";
import { KeepTaskDatabaseModule } from "./modules/keep-task-database/keep-task-database.module";
import { RunAffectedModule } from "./modules/run-affected/run-affected.module";
import { UpgradeDependenciesModule } from "./modules/upgrade-dependencies/upgrade-dependencies.module";
import { VerifyTaskDatabaseModule } from "./modules/verify-task-database/verify-task-database.module";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    AdoptTaskDatabaseModule,
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    DiscoveryModule,
    KeepTaskDatabaseModule,
    LoggerModule,
    RunAffectedModule,
    UpgradeDependenciesModule,
    VerifyTaskDatabaseModule,
  ],
})
export class MainModule {}
