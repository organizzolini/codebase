import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/observability/testing";

import { CallidescopeCoreService } from "./callidescope-core.service";

describe(CallidescopeCoreService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(CallidescopeCoreService);

    expect(instance).toBeInstanceOf(CallidescopeCoreService);
  });
});
