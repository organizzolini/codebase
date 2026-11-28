import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./installation.constants";
import { DependenciesModule } from "./modules/dependencies/dependencies.module";
import { InstalledSkillsModule } from "./modules/dependencies/modules/installed-skills/installed-skills.module";
import { UpdateReuiSkillModule } from "./modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.module";
import { UpgradeDependenciesModule } from "./modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.module";
import { EnvironmentFilesModule } from "./modules/environment-files/environment-files.module";
import { LocalServicesModule } from "./modules/local-services/local-services.module";
import { ReporterModule } from "./modules/reporter/reporter.module";
import { SessionBranchNameModule } from "./modules/session-branch-name/session-branch-name.module";
import { SessionWorktreeNameModule } from "./modules/session-worktree-name/session-worktree-name.module";
import { RemoteCacheModule } from "./modules/setup/modules/remote-cache/remote-cache.module";
import { SharedNxCacheModule } from "./modules/setup/modules/shared-nx-cache/shared-nx-cache.module";
import { SetupModule } from "./modules/setup/setup.module";
import { VscodeSettingsModule } from "./modules/shell-configuration/modules/vscode-settings/vscode-settings.module";
import { ShellConfigurationModule } from "./modules/shell-configuration/shell-configuration.module";
import { SoftwareModule } from "./modules/software/software.module";

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
    SessionBranchNameModule,
    SessionWorktreeNameModule,
    SetupModule,
    SharedNxCacheModule,
    ShellConfigurationModule,
    SoftwareModule,
    UpdateReuiSkillModule,
    UpgradeDependenciesModule,
    VscodeSettingsModule,
  ],
})
export class MainModule {}
