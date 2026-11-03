import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/observability/testing";

import { CodependixCoreService } from "./codependix-core.service";

describe(CodependixCoreService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(CodependixCoreService);

    expect(instance).toBeInstanceOf(CodependixCoreService);
  });
});
