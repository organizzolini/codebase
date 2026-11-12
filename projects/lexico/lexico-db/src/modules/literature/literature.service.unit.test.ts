import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { LiteratureService } from "./literature.service";

describe(LiteratureService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(LiteratureService);

    expect(instance).toBeInstanceOf(LiteratureService);
  });
});
