import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProgressiveCompoundEventService } from "./progressive-compound-event.service";

describe(ProgressiveCompoundEventService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      ProgressiveCompoundEventService,
    );

    expect(instance).toBeInstanceOf(ProgressiveCompoundEventService);
  });
});
