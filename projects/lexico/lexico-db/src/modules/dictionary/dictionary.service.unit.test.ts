import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { DictionaryService } from "./dictionary.service";

describe(DictionaryService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(DictionaryService);

    expect(instance).toBeInstanceOf(DictionaryService);
  });
});
