import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { TypeormMigrationSqlExtractorService } from "./typeorm-migration-sql-extractor.service";

describe(TypeormMigrationSqlExtractorService, () => {
  let service: TypeormMigrationSqlExtractorService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [TypeormMigrationSqlExtractorService],
    }).compile();

    service = await module.resolve(TypeormMigrationSqlExtractorService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });
});
