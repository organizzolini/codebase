import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { DatabaseService } from "./database.service";

describe(DatabaseService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(DatabaseService);

    expect(instance).toBeInstanceOf(DatabaseService);
  });
});
