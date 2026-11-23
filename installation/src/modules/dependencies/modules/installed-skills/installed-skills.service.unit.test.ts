import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { InstalledSkillsProcessService } from "./installed-skills-process.service";
import { InstalledSkillsService } from "./installed-skills.service";

// Behavior is tested through `InstalledSkillsCommand`, over this real service
// and a real workspace, which is the seam the spec agreed on.
describe(InstalledSkillsService, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(InstalledSkillsService, {
      mocks: [InstalledSkillsProcessService],
    });

    expect(instance).toBeInstanceOf(InstalledSkillsService);
  });
});
