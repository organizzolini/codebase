import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { HealthService } from "./health.service";

describe(HealthService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(HealthService);

    expect(instance).toBeInstanceOf(HealthService);
  });

  it("returns true for isHealthy", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(HealthService);

    expect(instance.isHealthy()).toBe(true);
  });
});
