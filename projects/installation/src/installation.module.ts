import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/logging";

import { environmentSchema } from "./installation.constants";
import { DependenciesModule } from "./modules/dependencies/dependencies.module";
import { EnvironmentFilesModule } from "./modules/environment-files/environment-files.module";
import { ReporterModule } from "./modules/reporter/reporter.module";
import { SetupModule } from "./modules/setup/setup.module";
import { ShellConfigurationModule } from "./modules/shell-configuration/shell-configuration.module";
import { SoftwareModule } from "./modules/software/software.module";

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
    DependenciesModule,
    DiscoveryModule,
    EnvironmentFilesModule,
    LoggerModule,
    ReporterModule,
    SetupModule,
    ShellConfigurationModule,
    SoftwareModule,
  ],
})
export class MainModule {}
