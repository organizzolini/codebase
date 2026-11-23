import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ConformetryGeneratorsModule } from "./modules/conformetry-generators/conformetry-generators.module";
import { ConventionalConfigModule } from "./modules/conventional-config/conventional-config.module";
import { DevcontainerConfigurationModule } from "./modules/devcontainer-configuration/devcontainer-configuration.module";
import { PackageManifestsModule } from "./modules/package-manifests/package-manifests.module";
import { ProjectPortsModule } from "./modules/project-ports/project-ports.module";
import { SkillExclusionsModule } from "./modules/skill-exclusions/skill-exclusions.module";
import { VscodeExtensionsModule } from "./modules/vscode-extensions/vscode-extensions.module";
import { SynchronizationMarkersService } from "./synchronization-markers.service";
import { SynchronizationCommand } from "./synchronization.command";
import { SynchronizationModule } from "./synchronization.module";
import { SynchronizationService } from "./synchronization.service";

describe(SynchronizationModule, () => {
  it("provides the contract services and the aggregate", () => {
    expect.hasAssertions();

    expectModuleImports(
      SynchronizationModule,
      LoggerModule,
      ConformetryGeneratorsModule,
      ConventionalConfigModule,
      DevcontainerConfigurationModule,
      PackageManifestsModule,
      ProjectPortsModule,
      SkillExclusionsModule,
      VscodeExtensionsModule,
    );
    expectModuleProvides(
      SynchronizationModule,
      SynchronizationCommand,
      SynchronizationMarkersService,
      SynchronizationService,
    );
  });
});
