import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { SqliteExportService } from "./sqlite-export.service";

describe(SqliteExportService, () => {
  let service: SqliteExportService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [SqliteExportService],
    }).compile();

    service = await module.resolve(SqliteExportService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });
});
