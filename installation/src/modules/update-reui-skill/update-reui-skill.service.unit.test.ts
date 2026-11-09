import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ReporterService } from "../reporter/reporter.service";

import { UpdateReuiSkillService } from "./update-reui-skill.service";

describe(UpdateReuiSkillService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(UpdateReuiSkillService, {
      mocks: [ReporterService],
    });

    expect(instance).toBeInstanceOf(UpdateReuiSkillService);
  });
});
