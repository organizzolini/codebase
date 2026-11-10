import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CoinagerieCoreService } from "./coinagerie-core.service";

describe(CoinagerieCoreService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(CoinagerieCoreService);

    expect(instance).toBeInstanceOf(CoinagerieCoreService);
  });
});
