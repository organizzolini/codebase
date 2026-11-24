import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { PostgresqlErdService } from "./postgresql-erd.service";

describe(PostgresqlErdService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PostgresqlErdService);
    const model = await instance.readModel([
      "testing/fixtures/postgresql-erd/department.entity.ts",
    ]);

    expect(instance).toBeInstanceOf(PostgresqlErdService);
    expect(model.entities.map(({ name }) => name)).toStrictEqual([
      "ErdDepartment",
    ]);
  });
});
