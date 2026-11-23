import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphEntitiesService } from "./graph-entities.service";

describe(GraphEntitiesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GraphEntitiesService);

    expect(instance).toBeInstanceOf(GraphEntitiesService);
  });
});
