import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderTreesService } from "./render-trees.service";

describe(RenderTreesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderTreesService);

    expect(instance).toBeInstanceOf(RenderTreesService);
  });
});
