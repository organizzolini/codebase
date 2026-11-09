import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { TagsService } from "./tags.service";

describe(TagsService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(TagsService);

    expect(instance).toBeInstanceOf(TagsService);
  });
});
