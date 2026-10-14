import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/logging";

import { AdoptTaskDatabaseModule } from "./modules/adopt-task-database/adopt-task-database.module";
import { KeepTaskDatabaseModule } from "./modules/keep-task-database/keep-task-database.module";
import { PublishablePackagesGateModule } from "./modules/publishable-packages-gate/publishable-packages-gate.module";
import { RunAffectedModule } from "./modules/run-affected/run-affected.module";
import { VerifyTaskDatabaseModule } from "./modules/verify-task-database/verify-task-database.module";
import { environmentSchema } from "./publication.constants";

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
    PublishablePackagesGateModule,
    RunAffectedModule,
    VerifyTaskDatabaseModule,
  ],
})
export class MainModule {}
