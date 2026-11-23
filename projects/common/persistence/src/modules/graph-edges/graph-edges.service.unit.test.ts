import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphEdgesService } from "./graph-edges.service";

describe(GraphEdgesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GraphEdgesService);

    expect(instance).toBeInstanceOf(GraphEdgesService);
  });
});
