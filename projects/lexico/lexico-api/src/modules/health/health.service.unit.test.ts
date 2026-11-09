import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { HealthService } from "./health.service";

describe(HealthService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(HealthService);

    expect(instance).toBeInstanceOf(HealthService);
  });

  it("returns true for isHealthy", () => {
    expect.hasAssertions();

    const service = new HealthService();

    expect(service.isHealthy()).toBe(true);
  });
});
