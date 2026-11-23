import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphDagService } from "./graph-dag.service";

describe(GraphDagService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GraphDagService);

    expect(instance).toBeInstanceOf(GraphDagService);
  });
});
