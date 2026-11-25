import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { CatalogManifestsCommand } from "./modules/catalog-manifests/catalog-manifests.command";
import { CatalogManifestsModule } from "./modules/catalog-manifests/catalog-manifests.module";
import { ConventionalConfigCommand } from "./modules/conventional-config/conventional-config.command";
import { ConventionalConfigModule } from "./modules/conventional-config/conventional-config.module";
import { DevcontainerConfigurationCommand } from "./modules/devcontainer-configuration/devcontainer-configuration.command";
import { DevcontainerConfigurationModule } from "./modules/devcontainer-configuration/devcontainer-configuration.module";
import { LockfileCommand } from "./modules/lockfile/lockfile.command";
import { LockfileModule } from "./modules/lockfile/lockfile.module";
import { PackageManifestsCommand } from "./modules/package-manifests/package-manifests.command";
import { PackageManifestsModule } from "./modules/package-manifests/package-manifests.module";
import { ProjectPortsModule } from "./modules/project-ports/project-ports.module";
import { ReadmeProjectsCommand } from "./modules/readme-projects/readme-projects.command";
import { ReadmeProjectsModule } from "./modules/readme-projects/readme-projects.module";
import { SkillExclusionsCommand } from "./modules/skill-exclusions/skill-exclusions.command";
import { SkillExclusionsModule } from "./modules/skill-exclusions/skill-exclusions.module";
import { VscodeExtensionsCommand } from "./modules/vscode-extensions/vscode-extensions.command";
import { VscodeExtensionsModule } from "./modules/vscode-extensions/vscode-extensions.module";
import { SynchronizationMarkersService } from "./synchronization-markers.service";
import { SynchronizationCommand } from "./synchronization.command";
import { SYNCHRONIZABLE_COMMANDS } from "./synchronization.constants";
import { SynchronizationService } from "./synchronization.service";

import type { SynchronizableCommand } from "./synchronization.types";

/**
 * Owns the contract every check and derivation shares, and the `start`
 * aggregate. To add a command to the aggregate, import its module and list it
 * in the `SYNCHRONIZABLE_COMMANDS` factory's `inject`. `project-ports` is
 * imported but left out of `inject`: it runs only by name.
 */
@Module({
  controllers: [],
  exports: [
    SynchronizationCommand,
    SynchronizationMarkersService,
    SynchronizationService,
  ],
  imports: [
    LoggerModule,
    CatalogManifestsModule,
    LockfileModule,
    ReadmeProjectsModule,
    ConventionalConfigModule,
    DevcontainerConfigurationModule,
    PackageManifestsModule,
    ProjectPortsModule,
    SkillExclusionsModule,
    VscodeExtensionsModule,
  ],
  providers: [
    SynchronizationCommand,
    SynchronizationMarkersService,
    SynchronizationService,
    {
      inject: [
        CatalogManifestsCommand,
        LockfileCommand,
        ReadmeProjectsCommand,
        ConventionalConfigCommand,
        DevcontainerConfigurationCommand,
        PackageManifestsCommand,
        SkillExclusionsCommand,
        VscodeExtensionsCommand,
      ],
      provide: SYNCHRONIZABLE_COMMANDS,
      useFactory: (
        ...commands: SynchronizableCommand[]
      ): SynchronizableCommand[] => commands,
    },
  ],
})
export class SynchronizationModule {}
