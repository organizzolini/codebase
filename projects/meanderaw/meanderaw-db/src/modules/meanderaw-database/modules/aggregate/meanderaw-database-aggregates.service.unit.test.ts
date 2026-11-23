import { createMock } from "@golevelup/ts-vitest";
import { getDataSourceToken } from "@nestjs/typeorm";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderawDatabaseAggregatesService } from "./meanderaw-database-aggregates.service";

import type { DataSource } from "typeorm";

describe(MeanderawDatabaseAggregatesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      MeanderawDatabaseAggregatesService,
      {
        providers: [
          {
            provide: getDataSourceToken(),
            useValue: createMock<DataSource>(),
          },
        ],
      },
    );

    expect(instance).toBeInstanceOf(MeanderawDatabaseAggregatesService);
  });
});
