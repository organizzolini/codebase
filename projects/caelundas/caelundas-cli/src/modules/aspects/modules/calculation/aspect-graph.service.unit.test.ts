import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { AspectGraphService } from "./aspect-graph.service";

describe(AspectGraphService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(AspectGraphService);

    expect(instance).toBeInstanceOf(AspectGraphService);
  });
});
