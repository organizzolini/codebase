import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./installation.constants";
import { DependenciesModule } from "./modules/dependencies/dependencies.module";
import { EnvironmentFilesModule } from "./modules/environment-files/environment-files.module";
import { InstalledSkillsModule } from "./modules/installed-skills/installed-skills.module";
import { LocalServicesModule } from "./modules/local-services/local-services.module";
import { ReporterModule } from "./modules/reporter/reporter.module";
import { RemoteCacheModule } from "./modules/setup/modules/remote-cache/remote-cache.module";
import { SharedNxCacheModule } from "./modules/setup/modules/shared-nx-cache/shared-nx-cache.module";
import { SetupModule } from "./modules/setup/setup.module";
import { ShellConfigurationModule } from "./modules/shell-configuration/shell-configuration.module";
import { SoftwareModule } from "./modules/software/software.module";
import { UpdateReuiSkillModule } from "./modules/update-reui-skill/update-reui-skill.module";
import { VscodeSettingsModule } from "./modules/vscode-settings/vscode-settings.module";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "configuration/.env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    DependenciesModule,
    DiscoveryModule,
    EnvironmentFilesModule,
    InstalledSkillsModule,
    LocalServicesModule,
    LoggerModule,
    RemoteCacheModule,
    ReporterModule,
    SetupModule,
    SharedNxCacheModule,
    ShellConfigurationModule,
    SoftwareModule,
    UpdateReuiSkillModule,
    VscodeSettingsModule,
  ],
})
export class MainModule {}
