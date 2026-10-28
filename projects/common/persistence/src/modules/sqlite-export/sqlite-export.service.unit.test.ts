import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { SqliteExportService } from "./sqlite-export.service";

describe(SqliteExportService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SqliteExportService);

    expect(instance).toBeInstanceOf(SqliteExportService);
  });
});
