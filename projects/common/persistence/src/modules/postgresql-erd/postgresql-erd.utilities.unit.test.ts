import { describe, expect, it } from "vitest";

import {
  isPostgresqlErdMarkdownCurrent,
  POSTGRESQL_ERD_MODEL_SCHEMA,
  readPostgresqlErdModel,
  renderPostgresqlErdModel,
  splicePostgresqlErdMarkdown,
} from "../../index";

import type { PostgresqlErdModel } from "../../index";

describe("postgresql ERD utilities", () => {
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

  it("uses reflected property types when view columns omit explicit types", async () => {
    const model = await readPostgresqlErdModel([
      "testing/fixtures/postgresql-erd/reflected-view.entity.ts",
    ]);

    expect(model).toStrictEqual({
      entities: [
        {
          columns: [
            {
              name: "count",
              nullable: false,
              primaryKey: false,
              type: "Number",
            },
            {
              name: "createdAt",
              nullable: false,
              primaryKey: false,
              type: "Date",
            },
            {
              name: "label",
              nullable: false,
              primaryKey: false,
              type: "String",
            },
            {
              name: "optionalLabel",
              nullable: false,
              primaryKey: false,
              type: "Object",
            },
          ],
          name: "ErdReflectedView",
          relations: [],
          tableName: "reflected_view",
        },
      ],
    });
  });

  describe(renderPostgresqlErdModel, () => {
    it("renders each relationship cardinality and the entity table names", () => {
      const model: PostgresqlErdModel = {
        entities: [
          {
            columns: [],
            name: "ErdSource",
            relations: [
              {
                cardinality: "one-to-one",
                name: "oneToOne",
                target: "ErdOneToOne",
              },
              {
                cardinality: "one-to-many",
                name: "oneToMany",
                target: "ErdOneToMany",
              },
              {
                cardinality: "many-to-one",
                name: "manyToOne",
                target: "ErdManyToOne",
              },
              {
                cardinality: "many-to-many",
                name: "manyToMany",
                target: "ErdManyToMany",
              },
            ],
            tableName: "sources",
          },
          { name: "ErdOneToOne" },
          { name: "ErdOneToMany" },
          { name: "ErdManyToOne" },
          { name: "ErdManyToMany" },
        ],
      };

      expect(renderPostgresqlErdModel(model)).toBe(
        [
          "erDiagram",
          "  sources ||--|| ErdOneToOne : oneToOne",
          "  sources ||--o{ ErdOneToMany : oneToMany",
          "  sources }o--|| ErdManyToOne : manyToOne",
          "  sources }o--o{ ErdManyToMany : manyToMany",
          "  sources {",
          "  }",
          "  ErdOneToOne",
          "  ErdOneToMany",
          "  ErdManyToOne",
          "  ErdManyToMany",
        ].join("\n"),
      );
    });

    it("maps column types and includes primary-key and nullability markers", () => {
      const model: PostgresqlErdModel = {
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
                name: "active",
                nullable: false,
                primaryKey: false,
                type: "Boolean",
              },
            ],
            name: "ErdExample",
            relations: [],
            tableName: "examples",
          },
        ],
      };

      expect(renderPostgresqlErdModel(model)).toBe(
        [
          "erDiagram",
          "  examples {",
          '    string id PK "not nullable"',
          '    string description "nullable"',
          '    boolean active "not nullable"',
          "  }",
        ].join("\n"),
      );
    });

    it("quotes entity names and relationship labels containing spaces", () => {
      const model: PostgresqlErdModel = {
        entities: [
          {
            columns: [],
            name: "ErdOwner",
            relations: [
              {
                cardinality: "many-to-one",
                name: "belongs to",
                target: "ErdUnusualTable",
              },
            ],
            tableName: "owners",
          },
          {
            columns: [],
            name: "ErdUnusualTable",
            relations: [],
            tableName: "unusual table",
          },
        ],
      };

      expect(renderPostgresqlErdModel(model)).toContain(
        '  owners }o--|| "unusual table" : "belongs to"',
      );
    });

    it("escapes column names and falls back for unknown types with spaces", () => {
      const model: PostgresqlErdModel = {
        entities: [
          {
            columns: [
              {
                name: "display name",
                nullable: true,
                primaryKey: false,
                type: "unrecognized type",
              },
            ],
            name: "ErdExample",
            relations: [],
            tableName: "examples",
          },
        ],
      };

      expect(renderPostgresqlErdModel(model)).toContain(
        '    string `display name` "nullable"',
      );
    });
  });

  describe(splicePostgresqlErdMarkdown, () => {
    const model: PostgresqlErdModel = {
      entities: [{ name: "ErdExample" }],
    };
    const block = [
      "<!-- postgresql-erd:start -->",
      "",
      "```mermaid",
      "erDiagram",
      "  ErdExample",
      "```",
      "",
      "<!-- postgresql-erd:end -->",
    ].join("\n");

    it("replaces only the anchored block and is idempotent", () => {
      const markdown = [
        "# Before",
        "<!-- postgresql-erd:start -->",
        "stale diagram",
        "<!-- postgresql-erd:end -->",
        "# After",
      ].join("\n");
      const spliced = splicePostgresqlErdMarkdown(markdown, model);

      expect(spliced).toBe(
        ["# Before", ...block.split("\n"), "# After"].join("\n"),
      );
      expect(splicePostgresqlErdMarkdown(spliced, model)).toBe(spliced);
    });

    it("appends the anchored block when the markdown has no markers", () => {
      expect(splicePostgresqlErdMarkdown("# Readme", model)).toBe(
        ["# Readme", "", ...block.split("\n"), ""].join("\n"),
      );
    });

    it("keeps a trailing newline when appending to markdown", () => {
      expect(splicePostgresqlErdMarkdown("# Readme\n", model)).toBe(
        ["# Readme", "", ...block.split("\n"), ""].join("\n"),
      );
    });

    it("creates the marker block for an empty markdown document", () => {
      expect(splicePostgresqlErdMarkdown("", model)).toBe(`${block}\n`);
    });

    it("creates the marker block when no markdown document exists", () => {
      expect(splicePostgresqlErdMarkdown(undefined, model)).toBe(`${block}\n`);
    });

    it("rejects an incomplete marker pair rather than replacing prose", () => {
      expect(() =>
        splicePostgresqlErdMarkdown(
          "<!-- postgresql-erd:start -->\nhandwritten",
          model,
        ),
      ).toThrow(/one ordered pair/);
    });
  });

  describe(isPostgresqlErdMarkdownCurrent, () => {
    const model: PostgresqlErdModel = {
      entities: [{ name: "ErdExample" }],
    };
    const freshMarkdown = [
      "<!-- postgresql-erd:start -->",
      "",
      "```mermaid",
      "erDiagram",
      "  ErdExample",
      "```",
      "",
      "<!-- postgresql-erd:end -->",
      "",
    ].join("\n");

    it("distinguishes fresh and stale markdown content", () => {
      expect(isPostgresqlErdMarkdownCurrent(freshMarkdown, model)).toBe(true);
      expect(
        isPostgresqlErdMarkdownCurrent(
          freshMarkdown.replace("  ErdExample", "  ErdStale"),
          model,
        ),
      ).toBe(false);
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

  it("includes the edge, node, and graph entities a graph generates, though no file exports them", async () => {
    const model = await readPostgresqlErdModel([
      "testing/fixtures/graphs/generated/network.entity.ts",
    ]);

    expect(model.entities.map(({ name }) => name).toSorted()).toStrictEqual([
      "Network",
      "NetworkLine",
      "Station",
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
