import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import {
  MeanderawDatabaseAggregatesService,
  MeanderawDatabaseService,
} from "@codebase/meanderaw-db";

import { catalogEntry } from "../../../testing/fixtures";
import {
  expectedTree,
  FIXTURES,
  generator,
  holds,
  LATE_MEANDER,
  matches,
  only,
  toRow,
  wire,
} from "../../../testing/groups-brute-force";
import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedMeanderaw,
  startMeanderawApplication,
} from "../../../testing/meanderaw-application";
import { MeandersModule } from "../meanders/meanders.module";

import { MeanderGroupsModule } from "./meander-groups.module";

import type {
  Fixture,
  Group,
  Rule,
  Tree,
} from "../../../testing/groups-brute-force";
import type { MeanderawApplication } from "../../../testing/meanderaw-application";

const GROUPS_QUERY = `query ($filter: MeanderFilterGroupInput, $groupBy: [MeanderGroupLevelInput!]!) {
  meanderGroups(filter: $filter, groupBy: $groupBy) {
    field value count
    groups { field value count groups { field value count groups { field value count } } }
  }
}`;

const TOTAL_QUERY = `query ($filter: MeanderFilterGroupInput) {
  meanders(filter: $filter, first: 1) { totalCount }
}`;

const groupSchema: z.ZodType<Tree> = z.object({
  count: z.number(),
  field: z.string(),
  groups: z
    .array(z.lazy(() => groupSchema))
    .nullish()
    .transform((groups) => groups ?? []),
  value: z.string(),
});

/** Groups and totals over a migrated, seeded Postgres, against brute force. */
describe("meander groups end-to-end suite", () => {
  let application: MeanderawApplication;
  let seeded: readonly Fixture[] = FIXTURES;

  /** What the API groups a filter's meanders into. */
  async function grouped(
    filter: Group | null,
    fields: readonly string[],
  ): Promise<Tree[]> {
    const body = await application.query(GROUPS_QUERY, {
      filter: filter === null ? null : wire(filter),
      groupBy: fields.map((field) => ({ field })),
    });

    expect(body.errors).toBeUndefined();

    return z.object({ meanderGroups: z.array(groupSchema) }).parse(body.data)
      .meanderGroups;
  }

  /** The total the API reports for a filter. */
  async function total(filter: Group | null): Promise<number> {
    const body = await application.query(TOTAL_QUERY, {
      filter: filter === null ? null : wire(filter),
    });

    expect(body.errors).toBeUndefined();

    return z
      .object({ meanders: z.object({ totalCount: z.number() }) })
      .parse(body.data).meanders.totalCount;
  }

  /**
   * Expects the groups and the total to equal a brute-force walk, and the
   * same request forced onto the computed path to agree with it.
   */
  async function expectBruteForce(
    filter: Group | null,
    fields: readonly string[],
    meanders: readonly Fixture[] = seeded,
  ): Promise<void> {
    const kept = meanders.filter(
      (fixture) => filter === null || matches(fixture, filter),
    );
    // A rule every meander meets, in a nested group no table covers.
    const computed: Group = {
      combinator: "and",
      groups: filter === null ? [] : [filter],
      rules: [{ field: "repeats", numbers: [1], operator: "gte" }],
    };

    for (const request of [filter, computed]) {
      await expect(grouped(request, fields)).resolves.toStrictEqual(
        expectedTree(kept, fields),
      );
      await expect(total(request)).resolves.toBe(kept.length);
    }
  }

  beforeAll(async () => {
    application = await startMeanderawApplication([
      MeandersModule,
      MeanderGroupsModule,
    ]);
    await seedMeanderaw(
      application.database,
      [
        catalogEntry("junctionCount"),
        catalogEntry("strokeCount"),
        catalogEntry("isChain", { isPattern: true }),
        catalogEntry("isLoop", { isPattern: true }),
      ],
      FIXTURES.map((fixture) => toRow(fixture)),
    );
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it.each([
    ["junctionCount"],
    ["strokeCount"],
    ["isChain"],
    ["rowsColumns"],
    ["rows"],
    ["columns"],
    ["lattice"],
    ["isHardcoded"],
  ])(
    "groups every meander by %s, the 0 or false bucket included",
    async (field) => {
      expect.hasAssertions();

      await expectBruteForce(null, [field]);
    },
  );

  it.each([
    [only({ field: "rows", numbers: [2], operator: "eq" })],
    [only({ field: "lattice", operator: "eq", text: "1" })],
    [
      {
        combinator: "and",
        rules: [
          { field: "rows", numbers: [3], operator: "lte" },
          { field: "columns", numbers: [1], operator: "eq" },
          { field: "lattice", operator: "ne", text: "1" },
        ],
      } satisfies Group,
    ],
    [only({ field: "rows", numbers: [9], operator: "eq" })],
  ])("groups within a shape filter by every kind of level", async (filter) => {
    expect.hasAssertions();

    for (const field of [
      "junctionCount",
      "isLoop",
      "rowsColumns",
      "lattice",
      "isHardcoded",
    ]) {
      await expectBruteForce(filter, [field]);
    }
  });

  it("groups within a pattern by any characteristic", async () => {
    expect.hasAssertions();

    const pattern = only({ field: "isChain", flag: true, operator: "is" });

    for (const field of [
      "junctionCount",
      "strokeCount",
      "isLoop",
      "isChain",
      "rowsColumns",
    ]) {
      await expectBruteForce(pattern, [field]);
    }

    await expectBruteForce(
      only({ field: "isLoop", flag: false, operator: "is_not" }),
      ["junctionCount"],
    );
  });

  it("returns exact totals for a single characteristic or shape rule", async () => {
    expect.hasAssertions();

    for (const [operator, numbers] of [
      ["eq", [0]],
      ["eq", [3]],
      ["ne", [0]],
      ["lt", [3]],
      ["lte", [0]],
      ["gt", [2]],
      ["gte", [0]],
      ["between", [0, 1]],
    ] as const) {
      const rule = { field: "junctionCount", numbers, operator };

      await expect(total(only(rule))).resolves.toBe(
        FIXTURES.filter((fixture) => holds(fixture, rule)).length,
      );
    }

    for (const rule of [
      { field: "isChain", flag: true, operator: "is" },
      { field: "isChain", flag: true, operator: "is_not" },
      { field: "isChain", flag: false, operator: "is" },
      { field: "rows", numbers: [2, 3], operator: "between" },
      { field: "columns", numbers: [1], operator: "ne" },
    ]) {
      await expect(total(only(rule))).resolves.toBe(
        FIXTURES.filter((fixture) => holds(fixture, rule)).length,
      );
    }
  });

  it("groups by several levels into nested keys with exact counts", async () => {
    expect.hasAssertions();

    await expectBruteForce(null, ["isChain", "rowsColumns"]);
    await expectBruteForce(null, ["junctionCount", "lattice", "isLoop"]);
    await expectBruteForce(null, ["rows", "columns", "junctionCount"]);
    await expectBruteForce(
      only({ field: "isChain", flag: true, operator: "is" }),
      ["isLoop", "junctionCount"],
    );
    await expectBruteForce(null, [
      "strokeCount",
      "junctionCount",
      "rowsColumns",
      "isHardcoded",
    ]);
  });

  it(
    "groups under filters no table covers exactly",
    async () => {
      expect.hasAssertions();

      const random = generator(2282);
      const pick = <T>(items: readonly T[]): T =>
        items[Math.floor(random() * items.length)] as T;
      const fields = [
        "junctionCount",
        "strokeCount",
        "isChain",
        "isLoop",
        "rowsColumns",
        "lattice",
        "isHardcoded",
      ];
      const rule = (): Rule =>
        pick<Rule>([
          { field: "repeats", numbers: [2], operator: "gte" },
          { field: "junctionCount", numbers: [1], operator: "lt" },
          { field: "strokeCount", numbers: [0], operator: "gt" },
          { field: "isChain", flag: true, operator: "is_not" },
          { field: "isHardcoded", flag: true, operator: "is" },
          { field: "rows", numbers: [3], operator: "lte" },
        ]);

      for (let index = 0; index < 25; index += 1) {
        const levels = Array.from({ length: 1 + (index % 3) }, () =>
          pick(fields),
        );

        await expectBruteForce(
          {
            combinator: pick(["and", "or"]),
            groups: [
              {
                combinator: pick(["and", "or"]),
                rules: [rule(), rule()],
              },
            ],
            rules: [rule()],
          },
          levels,
        );
      }
    },
    DATABASE_TIMEOUT_MILLISECONDS,
  );

  it("rejects what cannot be grouped by, or too many levels", async () => {
    expect.hasAssertions();

    const unknown = await application.query(GROUPS_QUERY, {
      groupBy: [{ field: "nonsense" }],
    });
    const empty = await application.query(GROUPS_QUERY, { groupBy: [] });
    const deep = await application.query(GROUPS_QUERY, {
      groupBy: Array.from({ length: 5 }, () => ({ field: "rowsColumns" })),
    });

    expect(unknown.errors?.[0]?.message).toContain(
      'Cannot group by "nonsense".',
    );
    expect(empty.errors).toHaveLength(1);
    expect(deep.errors).toHaveLength(1);
  });

  it("answers exactly after a write, from the tables again after a rebuild", async () => {
    expect.hasAssertions();

    const fresh = [...FIXTURES, LATE_MEANDER];
    const pattern = only({ field: "isChain", flag: true, operator: "is" });
    const service = application.database.module.get(MeanderawDatabaseService);
    const database = application.database.module.get(DataSource);

    await service.saveAll([toRow(LATE_MEANDER)]);
    seeded = fresh;

    // The write dropped the marker, so nothing is read from the old tables.
    await expectBruteForce(null, ["junctionCount"]);
    await expectBruteForce(pattern, ["strokeCount"]);

    await application.database.module
      .get(MeanderawDatabaseAggregatesService)
      .rebuild();

    // Back on the tables: a nudged table row shows up, which no count of the meanders would.
    const junction = `characteristic_id = (SELECT id FROM meanderaw.characteristics WHERE key = 'junctionCount')`;

    await expectBruteForce(null, ["junctionCount"]);
    await database.query(
      `UPDATE meanderaw.characteristic_value_counts SET meander_count = meander_count + 1 WHERE ${junction} AND value = 1`,
    );

    const nudgedGroups = await grouped(null, ["junctionCount"]);
    const nudged = nudgedGroups.find(({ value }) => value === "1");
    const counted = expectedTree(fresh, ["junctionCount"]).find(
      ({ value }) => value === "1",
    );

    expect(nudged?.count).toBe((counted?.count ?? 0) + 1);

    // Rows adding up to more than the total are refused, not hidden.
    await database.query(
      `UPDATE meanderaw.characteristic_value_counts SET meander_count = meander_count + 100000 WHERE ${junction} AND value = 1`,
    );
    await expectBruteForce(null, ["junctionCount"]);

    // Shape totals the marker does not agree with are refused too.
    await application.database.module
      .get(MeanderawDatabaseAggregatesService)
      .rebuild();
    await database.query(
      "UPDATE meanderaw.shape_counts SET meander_count = meander_count + 1",
    );
    await expectBruteForce(null, ["lattice"]);
  });
});
