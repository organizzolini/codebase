import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/logging";

import { environmentSchema } from "./constants";
import { PublishablePackagesGateModule } from "./modules/publishable-packages-gate/publishable-packages-gate.module";
import { RunAffectedModule } from "./modules/run-affected/run-affected.module";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    DiscoveryModule,
    LoggerModule,
    PublishablePackagesGateModule,
    RunAffectedModule,
  ],
})
export class MainModule {}
