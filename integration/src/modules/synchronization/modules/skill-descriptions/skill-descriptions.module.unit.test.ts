import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { SkillDescriptionsCommand } from "./skill-descriptions.command";
import { SkillDescriptionsModule } from "./skill-descriptions.module";
import { SkillDescriptionsService } from "./skill-descriptions.service";

describe(SkillDescriptionsModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(SkillDescriptionsModule, LoggerModule);
    expectModuleProvides(
      SkillDescriptionsModule,
      SkillDescriptionsCommand,
      SkillDescriptionsService,
    );
  });
});
