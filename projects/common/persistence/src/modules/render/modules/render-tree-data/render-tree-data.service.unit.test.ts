import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderTreeDataService } from "./render-tree-data.service";

describe(RenderTreeDataService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderTreeDataService);

    expect(instance).toBeInstanceOf(RenderTreeDataService);
  });
});
