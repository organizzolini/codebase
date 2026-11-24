import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderEntitiesService } from "./render-entities.service";

describe(RenderEntitiesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderEntitiesService);

    expect(instance).toBeInstanceOf(RenderEntitiesService);
  });
});
