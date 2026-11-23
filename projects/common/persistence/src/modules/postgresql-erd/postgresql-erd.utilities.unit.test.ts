import { describe, expect, it } from "vitest";

import {
  POSTGRESQL_ERD_MODEL_SCHEMA,
  readPostgresqlErdModel,
} from "../../index";

describe(readPostgresqlErdModel, () => {
  it("reads exported entities, their columns, and many-to-one relations", async () => {
    const model = await readPostgresqlErdModel([
      "testing/fixtures/postgresql-erd/department.entity.ts",
      "testing/fixtures/postgresql-erd/employee.entity.ts",
    ]);

    expect(model).toStrictEqual({
      entities: [
        {
          columns: [
            {
              name: "id",
              nullable: false,
              primaryKey: true,
              type: "uuid",
            },
            {
              name: "description",
              nullable: true,
              primaryKey: false,
              type: "text",
            },
            {
              name: "managerCode",
              nullable: false,
              primaryKey: false,
              type: "String",
            },
          ],
          name: "ErdDepartment",
          relations: [],
          tableName: "departments",
        },
        {
          columns: [
            {
              name: "id",
              nullable: false,
              primaryKey: true,
              type: "uuid",
            },
            {
              name: "name",
              nullable: false,
              primaryKey: false,
              type: "text",
            },
          ],
          name: "ErdEmployee",
          relations: [
            {
              cardinality: "many-to-one",
              name: "department",
              target: "ErdDepartment",
            },
          ],
          tableName: "ErdEmployee",
        },
      ],
    });
  });

  it("adds a name-only relation target without following its relations", async () => {
    const model = await readPostgresqlErdModel([
      "testing/fixtures/postgresql-erd/external-owner.entity.ts",
    ]);

    expect(model.entities).toStrictEqual([
      {
        columns: [
          {
            name: "id",
            nullable: false,
            primaryKey: true,
            type: "uuid",
          },
        ],
        name: "ErdExternalOwner",
        relations: [
          {
            cardinality: "many-to-one",
            name: "organization",
            target: "ErdExternalOrganization",
          },
          {
            cardinality: "many-to-one",
            name: "secondaryOrganization",
            target: "ErdExternalOrganization",
          },
        ],
        tableName: "ErdExternalOwner",
      },
      { name: "ErdExternalOrganization" },
    ]);
  });

  it("includes columns inherited from the Postgresql identifiable entity", async () => {
    const model = await readPostgresqlErdModel([
      "testing/fixtures/postgresql-erd/employee.entity.ts",
    ]);
    const employee = model.entities.find(({ name }) => name === "ErdEmployee");

    if (employee === undefined || !("columns" in employee)) {
      throw new Error("Expected the employee entity to include columns.");
    }

    const expectedColumn: {
      name: string;
      nullable: boolean;
      primaryKey: boolean;
      type: string;
    } = {
      name: "id",
      nullable: false,
      primaryKey: true,
      type: "uuid",
    };

    expect(employee.columns).toContainEqual(expectedColumn);
  });

  it("fails when an entity glob matches no file", async () => {
    await expect(
      readPostgresqlErdModel([
        "testing/fixtures/postgresql-erd/missing-*.entity.ts",
      ]),
    ).rejects.toThrow(
      'No files matched entity glob "testing/fixtures/postgresql-erd/missing-*.entity.ts".',
    );
  });

  it("fails when no entity globs are provided", async () => {
    await expect(readPostgresqlErdModel([])).rejects.toThrow(
      "No entity file globs were provided.",
    );
  });

  it("fails when matched files export no decorated entity", async () => {
    await expect(
      readPostgresqlErdModel([
        "testing/fixtures/postgresql-erd/no-entity.fixture.ts",
      ]),
    ).rejects.toThrow(
      "No exported @Entity classes found in matched files for globs: testing/fixtures/postgresql-erd/no-entity.fixture.ts",
    );
  });

  it("rejects malformed full entities instead of parsing them as references", () => {
    expect(() =>
      POSTGRESQL_ERD_MODEL_SCHEMA.parse({
        entities: [{ columns: "invalid", name: "ErdDepartment" }],
      }),
    ).toThrow(/unrecognized key/i);
  });
});
