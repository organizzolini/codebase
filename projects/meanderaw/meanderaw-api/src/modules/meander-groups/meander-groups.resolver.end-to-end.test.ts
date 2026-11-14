import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { catalogEntry, meanderRow } from "../../../testing/fixtures";
import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedMeanderaw,
  startMeanderawApplication,
} from "../../../testing/meanderaw-application";
import { MeandersModule } from "../meanders/meanders.module";

import { MeanderGroupsModule } from "./meander-groups.module";

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

interface Fixture {
  readonly code: string;
  readonly columns: number;
  readonly isChain: boolean;
  readonly isHardcoded: boolean;
  readonly isLoop: boolean;
  readonly junctionCount: number;
  readonly lattice: string;
  readonly repeats: number;
  readonly rows: number;
  readonly strokeCount: number;
}

interface Group {
  readonly combinator: "and" | "or";
  readonly groups?: readonly Group[];
  readonly rules?: readonly Rule[];
}

interface Rule {
  readonly field: string;
  readonly flag?: boolean;
  readonly numbers?: readonly number[];
  readonly operator: string;
  readonly text?: string;
}

interface Tree {
  count: number;
  field: string;
  groups: Tree[];
  value: string;
}

/** A hundred and twenty meanders spread over every field, many values missing. */
const FIXTURES: readonly Fixture[] = Array.from(
  { length: 120 },
  (_, index) => ({
    code: `01x${String(index).padStart(3, "0")}`,
    columns: (index % 2) + 1,
    isChain: index % 3 === 0,
    isHardcoded: index % 4 === 0,
    isLoop: index % 5 < 2,
    junctionCount: [0, 1, 3, 0, 2, 4, 1, 0][index % 8] ?? 0,
    lattice: index % 7 < 3 ? "0" : "1",
    repeats: (index % 3) + 1,
    rows: (index % 4) + 1,
    strokeCount: index % 7 < 3 ? 0 : (index % 7) - 2,
  }),
);

const collator = new Intl.Collator("en", { numeric: true });

/** The tree a brute-force walk of the fixtures gives, keys in natural order. */
function expectedTree(
  fixtures: readonly Fixture[],
  fields: readonly string[],
): Tree[] {
  const [field, ...rest] = fields;

  if (field === undefined) {
    return [];
  }

  const byKey = new Map<string, Fixture[]>();

  for (const fixture of fixtures) {
    const key = keyOf(fixture, field);

    byKey.set(key, [...(byKey.get(key) ?? []), fixture]);
  }

  return [...byKey.entries()]
    .toSorted(([left], [right]) => collator.compare(left, right))
    .map(([value, members]) => ({
      count: members.length,
      field,
      groups: expectedTree(members, rest),
      value,
    }));
}

/** A repeatable pseudo-random generator, so the trees are the same every run. */
function generator(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;

    return state / 4_294_967_296;
  };
}

/** Whether a rule holds for a fixture, written independently of the API. */
function holds(fixture: Fixture, rule: Rule): boolean {
  const value = fixture[rule.field as keyof Fixture];
  const [first = 0, second = 0] = rule.numbers ?? [];
  const compared = rule.text ?? first;

  switch (rule.operator) {
    case "between": {
      return Number(value) >= first && Number(value) <= second;
    }
    case "eq": {
      return value === compared;
    }
    case "gt": {
      return Number(value) > first;
    }
    case "gte": {
      return Number(value) >= first;
    }
    case "is": {
      return value === rule.flag;
    }
    case "is_not": {
      return value !== rule.flag;
    }
    case "lt": {
      return Number(value) < first;
    }
    case "lte": {
      return Number(value) <= first;
    }
    default: {
      return value !== compared;
    }
  }
}

/** The text a group key reads as, written independently of the API. */
function keyOf(fixture: Fixture, field: string): string {
  switch (field) {
    case "isChain":
    case "isLoop": {
      return String(fixture[field]);
    }
    case "isHardcoded": {
      return String(fixture.isHardcoded);
    }
    case "lattice": {
      return fixture.lattice;
    }
    case "rowsColumns": {
      return `${fixture.rows}x${fixture.columns}`;
    }
    default: {
      return String(fixture[field as "junctionCount" | "strokeCount"]);
    }
  }
}

/** Whether a tree holds for a fixture. */
function matches(fixture: Fixture, group: Group): boolean {
  const results = [
    ...(group.rules ?? []).map((rule) => holds(fixture, rule)),
    ...(group.groups ?? []).map((child) => matches(fixture, child)),
  ];

  return group.combinator === "and"
    ? results.every(Boolean)
    : results.some(Boolean);
}

/** A tree as GraphQL spells it: enum names in capitals. */
function wire(group: Group): unknown {
  return {
    ...group,
    combinator: group.combinator.toUpperCase(),
    groups: group.groups?.map((child) => wire(child)),
    rules: group.rules?.map((rule) => ({
      ...rule,
      operator: rule.operator.toUpperCase(),
    })),
  };
}

/** A single-rule tree. */
const only = (rule: Rule): Group => ({ combinator: "and", rules: [rule] });

/** Groups and totals over a migrated, seeded Postgres, against brute force. */
describe("meander groups end-to-end suite", () => {
  let application: MeanderawApplication;

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

  /** Expects the groups and the total to equal a brute-force walk. */
  async function expectBruteForce(
    filter: Group | null,
    fields: readonly string[],
    meanders: readonly Fixture[] = FIXTURES,
  ): Promise<void> {
    const kept = meanders.filter(
      (fixture) => filter === null || matches(fixture, filter),
    );

    await expect(grouped(filter, fields)).resolves.toStrictEqual(
      expectedTree(kept, fields),
    );
    await expect(total(filter)).resolves.toBe(kept.length);
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

  it("groups under filters no table covers exactly", async () => {
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
  });

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
});

/** A fixture as the row the draw run would write. */
function toRow(fixture: Fixture): ReturnType<typeof meanderRow> {
  return meanderRow({
    characteristics: {
      ...(fixture.junctionCount > 0
        ? { junctionCount: fixture.junctionCount }
        : {}),
      ...(fixture.strokeCount > 0 ? { strokeCount: fixture.strokeCount } : {}),
      ...(fixture.isChain ? { isChain: true } : {}),
      ...(fixture.isLoop ? { isLoop: true } : {}),
    },
    code: fixture.code,
    columns: fixture.columns,
    isHardcoded: fixture.isHardcoded,
    lattice: fixture.lattice,
    repeats: fixture.repeats,
    rows: fixture.rows,
  });
}
