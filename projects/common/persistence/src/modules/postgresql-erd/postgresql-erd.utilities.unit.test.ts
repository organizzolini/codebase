import { describe, expect, it } from "vitest";

import {
  isPostgresqlErdMarkdownCurrent,
  POSTGRESQL_ERD_MODEL_SCHEMA,
  readPostgresqlErdModel,
  renderPostgresqlErdModel,
  splicePostgresqlErdMarkdown,
} from "../../index";

import { renderPostgresqlErdSections } from "./postgresql-erd-sections.utilities";

import type { PostgresqlErdModel } from "../../index";

/** Stands in for the Mermaid renderer: names the tables drawn. */
function draw(model: PostgresqlErdModel): string {
  return `erDiagram\n  %% ${model.entities.map(({ name }) => name).join(" ")}`;
}

/** An entity with the given relations, each a many-to-one to a table name. */
function table(
  name: string,
  ...targets: string[]
): PostgresqlErdModel["entities"][number] {
  return {
    columns: [],
    name,
    relations: targets.map((target) => ({
      cardinality: "many-to-one" as const,
      name: target,
      target,
    })),
    tableName: name,
  };
}

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
          kind: "view",
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
          "  direction LR",
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
          "  direction LR",
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
      "  direction LR",
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
      "  direction LR",
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

  it("includes the closure table of a tree and the join table of a many-to-many, as TypeORM creates them", async () => {
    const model = await readPostgresqlErdModel([
      "testing/fixtures/postgresql-erd/article.entity.ts",
      "testing/fixtures/postgresql-erd/category.entity.ts",
    ]);
    const derived = model.entities.filter(
      (entity) => "kind" in entity && entity.kind !== undefined,
    );

    expect(derived).toStrictEqual([
      {
        columns: [
          {
            name: "erd_articles_id",
            nullable: false,
            primaryKey: true,
            type: "uuid",
          },
          {
            name: "erd_categories_id",
            nullable: false,
            primaryKey: true,
            type: "uuid",
          },
        ],
        kind: "join-table",
        name: "erd_articles_erd_categories",
        relations: [
          {
            cardinality: "many-to-one",
            name: "erd_articles_id",
            target: "erd_articles",
          },
          {
            cardinality: "many-to-one",
            name: "erd_categories_id",
            target: "erd_categories",
          },
        ],
        tableName: "erd_articles_erd_categories",
      },
      {
        columns: [
          {
            name: "id_ancestor",
            nullable: false,
            primaryKey: true,
            type: "uuid",
          },
          {
            name: "id_descendant",
            nullable: false,
            primaryKey: true,
            type: "uuid",
          },
        ],
        kind: "closure-table",
        name: "erd_categories_closure",
        relations: [
          {
            cardinality: "many-to-one",
            name: "id_ancestor",
            target: "erd_categories",
          },
          {
            cardinality: "many-to-one",
            name: "id_descendant",
            target: "erd_categories",
          },
        ],
        tableName: "erd_categories_closure",
      },
    ]);
  });

  it("draws a derived table with its foreign keys to the entity's name", async () => {
    const rendered = renderPostgresqlErdModel(
      await readPostgresqlErdModel([
        "testing/fixtures/postgresql-erd/category.entity.ts",
      ]),
    );

    expect(rendered).toContain(
      "erd_categories_closure }o--|| erd_categories : id_ancestor",
    );
    expect(rendered).toContain(
      '  erd_categories_closure {\n    string id_ancestor PK "not nullable"',
    );
  });

  it("marks a view as one, in the model and in its drawn title", async () => {
    const model = await readPostgresqlErdModel([
      "testing/fixtures/postgresql-erd/reflected-view.entity.ts",
    ]);

    expect(model.entities).toMatchObject([
      { kind: "view", tableName: "reflected_view" },
    ]);
    expect(renderPostgresqlErdModel(model)).toContain(
      '  reflected_view["reflected_view (view)"] {',
    );
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

  describe(renderPostgresqlErdSections, () => {
    it("draws one fenced diagram when the tables are one group", () => {
      expect(
        renderPostgresqlErdSections(
          { entities: [table("a", "b"), table("b")] },
          draw,
        ),
      ).toStrictEqual(["```mermaid\nerDiagram\n  %% a b\n```"]);
    });

    it("splits groups of related tables under linked headings, standalone tables last", () => {
      const lines = renderPostgresqlErdSections(
        {
          entities: [
            table("a", "b", "c"),
            table("b"),
            table("c"),
            table("lone"),
            table("x", "y"),
            table("y"),
            table("single"),
          ],
        },
        draw,
      );

      expect(lines[0]).toBe(
        "[a (3 tables)](#a-3-tables) · [x (2 tables)](#x-2-tables) · [Standalone tables](#standalone-tables)",
      );
      expect(lines).toContain("## a (3 tables)");
      expect(lines).toContain("## x (2 tables)");
      expect(lines).toContain("## Standalone tables");
      expect(lines.join("\n")).toContain("  %% lone single");
    });

    it("joins tables through a relation to an entity named by its class, and keeps name-only targets with their source", () => {
      const owner = { ...table("owners", "Gadget"), name: "Owner" };
      const lines = renderPostgresqlErdSections(
        {
          entities: [
            owner,
            { name: "Gadget" },
            table("other", "Elsewhere"),
            { name: "Elsewhere" },
          ],
        },
        draw,
      );

      expect(lines.join("\n")).toContain("  %% Owner Gadget\n");
      expect(lines.join("\n")).toContain("  %% other Elsewhere\n");
    });

    it("groups a table with the target of a relation to a table no entity describes", () => {
      const lines = renderPostgresqlErdSections(
        { entities: [table("a", "ghost"), table("b", "ghost"), table("c")] },
        draw,
      );

      expect(lines[0]).toBe(
        "[a (2 tables)](#a-2-tables) · [Standalone tables](#standalone-tables)",
      );
    });

    it("titles a table that relates only to itself by its name", () => {
      const lines = renderPostgresqlErdSections(
        { entities: [table("a", "a"), table("b", "c"), table("c")] },
        draw,
      );

      expect(lines[0]).toBe("[a](#a) · [b (2 tables)](#b-2-tables)");
    });

    it("titles a group by its most related table", () => {
      const lines = renderPostgresqlErdSections(
        {
          entities: [
            table("a", "hub"),
            table("b", "hub"),
            table("hub"),
            table("p", "q"),
            table("q"),
          ],
        },
        draw,
      );

      expect(lines[0]).toContain("[hub (3 tables)]");
    });
  });
});
