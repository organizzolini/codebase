import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodometerCoreService } from "./codometer-core.service";

describe(CodometerCoreService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(CodometerCoreService);

    expect(instance).toBeInstanceOf(CodometerCoreService);
  });
});
