import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ConformetryGeneratorsModule } from "../conformetry-generators/conformetry-generators.module";
import { ConventionalConfigModule } from "../conventional-config/conventional-config.module";
import { DevcontainerConfigurationModule } from "../devcontainer-configuration/devcontainer-configuration.module";
import { InstalledSkillsModule } from "../installed-skills/installed-skills.module";
import { ProjectPortsModule } from "../project-ports/project-ports.module";
import { PullRequestTemplateModule } from "../pull-request-template/pull-request-template.module";
import { SkillExclusionsModule } from "../skill-exclusions/skill-exclusions.module";
import { TypeormMigrationSqlModule } from "../typeorm-migration-sql/typeorm-migration-sql.module";
import { VscodeExtensionsModule } from "../vscode-extensions/vscode-extensions.module";
import { VscodeSettingsModule } from "../vscode-settings/vscode-settings.module";

import { SynchronizationCommand } from "./synchronization.command";
import { SynchronizationModule } from "./synchronization.module";
import { SynchronizationService } from "./synchronization.service";

describe(SynchronizationModule, () => {
  it("registers every synchronization command's module as an import", () => {
    expect.hasAssertions();

    expectModuleImports(
      SynchronizationModule,
      LoggerModule,
      ConformetryGeneratorsModule,
      ConventionalConfigModule,
      DevcontainerConfigurationModule,
      InstalledSkillsModule,
      ProjectPortsModule,
      PullRequestTemplateModule,
      SkillExclusionsModule,
      TypeormMigrationSqlModule,
      VscodeExtensionsModule,
      VscodeSettingsModule,
    );
    expectModuleProvides(
      SynchronizationModule,
      SynchronizationCommand,
      SynchronizationService,
    );
  });
});
