import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderEdgesService } from "./render-edges.service";

describe(RenderEdgesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderEdgesService);

    expect(instance).toBeInstanceOf(RenderEdgesService);
  });
});
