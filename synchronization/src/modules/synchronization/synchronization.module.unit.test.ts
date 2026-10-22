import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { ConformetryGeneratorsModule } from "../conformetry-generators/conformetry-generators.module";
import { ConventionalConfigModule } from "../conventional-config/conventional-config.module";
import { DevcontainerConfigurationModule } from "../devcontainer-configuration/devcontainer-configuration.module";
import { InstalledSkillsModule } from "../installed-skills/installed-skills.module";
import { ProjectPortsModule } from "../project-ports/project-ports.module";
import { PullRequestLabelsModule } from "../pull-request-labels/pull-request-labels.module";
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
    const imports = Reflect.getMetadata("imports", SynchronizationModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      SynchronizationModule,
    ) as undefined | unknown[];

    expect(imports).toBeDefined();
    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ConformetryGeneratorsModule);
    expect(imports).toContain(ConventionalConfigModule);
    expect(imports).toContain(DevcontainerConfigurationModule);
    expect(imports).toContain(InstalledSkillsModule);
    expect(imports).toContain(ProjectPortsModule);
    expect(imports).toContain(PullRequestLabelsModule);
    expect(imports).toContain(PullRequestTemplateModule);
    expect(imports).toContain(SkillExclusionsModule);
    expect(imports).toContain(TypeormMigrationSqlModule);
    expect(imports).toContain(VscodeExtensionsModule);
    expect(imports).toContain(VscodeSettingsModule);

    expect(providers).toBeDefined();
    expect(providers).toContain(SynchronizationCommand);
    expect(providers).toContain(SynchronizationService);
  });
});
