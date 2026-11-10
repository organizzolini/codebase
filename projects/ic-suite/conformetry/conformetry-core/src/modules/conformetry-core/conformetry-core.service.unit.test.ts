import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ConformetryCoreService } from "./conformetry-core.service";

describe(ConformetryCoreService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ConformetryCoreService);

    expect(instance).toBeInstanceOf(ConformetryCoreService);
  });
});
