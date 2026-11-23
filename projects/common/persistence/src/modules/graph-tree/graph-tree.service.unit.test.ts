import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphTreeService } from "./graph-tree.service";

describe(GraphTreeService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GraphTreeService);

    expect(instance).toBeInstanceOf(GraphTreeService);
  });
});
