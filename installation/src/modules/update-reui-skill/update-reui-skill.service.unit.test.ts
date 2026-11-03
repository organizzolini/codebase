import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ReporterService } from "../reporter/reporter.service";

import { UpdateReuiSkillService } from "./update-reui-skill.service";

describe(UpdateReuiSkillService, () => {
  const moduleOptions = { mocks: [ReporterService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      UpdateReuiSkillService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(UpdateReuiSkillService);
  });
});
