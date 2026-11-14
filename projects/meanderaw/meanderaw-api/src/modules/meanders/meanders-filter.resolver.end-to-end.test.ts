import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { catalogEntry, meanderRow } from "../../../testing/fixtures";
import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedMeanderaw,
  startMeanderawApplication,
} from "../../../testing/meanderaw-application";

import { MeandersModule } from "./meanders.module";

import type { MeanderawApplication } from "../../../testing/meanderaw-application";

const QUERY = `query ($filter: MeanderFilterGroupInput, $sort: MeanderSortInput, $first: Int, $after: String) {
  meanders(filter: $filter, sort: $sort, first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges { node { code } }
  }
}`;

const pageSchema = z.object({
  meanders: z.object({
    edges: z.array(z.object({ node: z.object({ code: z.string() }) })),
    pageInfo: z.object({
      endCursor: z.string().nullable(),
      hasNextPage: z.boolean(),
    }),
    totalCount: z.number(),
  }),
});

interface Fixture {
  readonly code: string;
  readonly columns: number;
  readonly isChain: boolean;
  readonly isHardcoded: boolean;
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

/** Forty meanders spread over each field, many values missing. */
const FIXTURES: readonly Fixture[] = Array.from({ length: 40 }, (_, index) => ({
  code: `01x${String(index).padStart(2, "0")}`,
  columns: (index % 2) + 1,
  isChain: index % 3 === 0,
  isHardcoded: index % 4 === 0,
  junctionCount: [0, 1, 3, 0, 2, 4, 1, 0][index % 8] ?? 0,
  lattice: index % 5 < 2 ? "0" : "1",
  repeats: (index % 3) + 1,
  rows: (index % 4) + 1,
  strokeCount: index % 7 < 3 ? 0 : (index % 7) - 2,
}));

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
  const value = valueOf(fixture, rule.field);
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

/** The value a field holds for a fixture, a missing one as 0 or false. */
function valueOf(fixture: Fixture, field: string): boolean | number | string {
  return fixture[field as keyof Fixture];
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

/** Sends the meanders query with a rule tree to a migrated, seeded Postgres. */
describe("meanders filter end-to-end suite", () => {
  let application: MeanderawApplication;

  /** The codes a tree selects, and the total the API reports for it. */
  async function select(
    filter: Group,
    extra: Record<string, unknown> = {},
  ): Promise<{ codes: string[]; totalCount: number }> {
    const body = await application.query(QUERY, {
      filter: wire(filter),
      first: 200,
      ...extra,
    });

    expect(body.errors).toBeUndefined();

    const { meanders } = pageSchema.parse(body.data);

    return {
      codes: meanders.edges.map(({ node }) => node.code),
      totalCount: meanders.totalCount,
    };
  }

  /** Expects the API to select exactly what brute force does. */
  async function expectBruteForce(filter: Group): Promise<void> {
    const expected = FIXTURES.filter((fixture) => matches(fixture, filter))
      .map(({ code }) => code)
      .toSorted();
    const { codes, totalCount } = await select(filter);

    expect(codes.toSorted()).toStrictEqual(expected);
    expect(totalCount).toBe(expected.length);
  }

  /** A single-rule tree. */
  const only = (rule: Rule): Group => ({ combinator: "and", rules: [rule] });

  beforeAll(async () => {
    application = await startMeanderawApplication([MeandersModule]);
    await seedMeanderaw(
      application.database,
      [
        catalogEntry("junctionCount"),
        catalogEntry("strokeCount"),
        catalogEntry("isChain", { isPattern: true }),
      ],
      FIXTURES.map((fixture) =>
        meanderRow({
          characteristics: {
            ...(fixture.junctionCount > 0
              ? { junctionCount: fixture.junctionCount }
              : {}),
            ...(fixture.strokeCount > 0
              ? { strokeCount: fixture.strokeCount }
              : {}),
            ...(fixture.isChain ? { isChain: true } : {}),
          },
          code: fixture.code,
          columns: fixture.columns,
          isHardcoded: fixture.isHardcoded,
          lattice: fixture.lattice,
          repeats: fixture.repeats,
          rows: fixture.rows,
        }),
      ),
    );
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it.each([
    ["eq", [0]],
    ["eq", [3]],
    ["ne", [0]],
    ["ne", [3]],
    ["lt", [3]],
    ["lt", [1]],
    ["lte", [0]],
    ["lte", [3]],
    ["gt", [0]],
    ["gt", [2]],
    ["gte", [1]],
    ["gte", [0]],
    ["between", [0, 1]],
    ["between", [2, 4]],
  ])(
    "returns what brute force does for a characteristic %s %j, a missing value as 0",
    async (operator, numbers) => {
      expect.hasAssertions();

      await expectBruteForce(
        only({ field: "junctionCount", numbers, operator }),
      );
    },
  );

  it("treats a boolean characteristic's missing value as false", async () => {
    expect.hasAssertions();

    for (const operator of ["is", "is_not"]) {
      for (const flag of [true, false]) {
        await expectBruteForce(only({ field: "isChain", flag, operator }));
      }
    }

    const none = await select(
      only({ field: "isChain", flag: false, operator: "is" }),
    );

    expect(none.totalCount).toBe(FIXTURES.filter((f) => !f.isChain).length);
  });

  it("filters every shape field", async () => {
    expect.hasAssertions();

    for (const rule of [
      { field: "rows", numbers: [2], operator: "gte" },
      { field: "columns", numbers: [1], operator: "eq" },
      { field: "repeats", numbers: [1, 2], operator: "between" },
      { field: "rows", numbers: [3], operator: "ne" },
      { field: "lattice", operator: "eq", text: "1" },
      { field: "lattice", operator: "ne", text: "1" },
      { field: "isHardcoded", flag: true, operator: "is" },
      { field: "isHardcoded", flag: true, operator: "is_not" },
    ]) {
      await expectBruteForce(only(rule));
    }
  });

  it("returns exactly the brute-force result for nested and/or trees", async () => {
    expect.hasAssertions();

    const random = generator(2280);
    const operators = ["eq", "ne", "lt", "lte", "gt", "gte"];
    const pick = <T>(items: readonly T[]): T =>
      items[Math.floor(random() * items.length)] as T;
    const rule = (): Rule => {
      const field = pick(["junctionCount", "strokeCount", "rows", "isChain"]);

      return field === "isChain"
        ? { field, flag: random() < 0.5, operator: pick(["is", "is_not"]) }
        : {
            field,
            numbers: [Math.floor(random() * 4)],
            operator: pick(operators),
          };
    };
    const group = (depth: number): Group => ({
      combinator: pick(["and", "or"]),
      groups:
        depth > 0
          ? Array.from({ length: Math.floor(random() * 3) }, () =>
              group(depth - 1),
            )
          : [],
      rules: Array.from({ length: 1 + Math.floor(random() * 3) }, rule),
    });

    for (let index = 0; index < 30; index += 1) {
      await expectBruteForce(group(2));
    }
  });

  it("returns the brute-force result for flat AND trees in every rule order", async () => {
    expect.hasAssertions();

    const rules: Rule[] = [
      { field: "strokeCount", numbers: [1], operator: "gte" },
      { field: "junctionCount", numbers: [3], operator: "lt" },
      { field: "isChain", flag: true, operator: "is" },
      { field: "junctionCount", numbers: [0], operator: "gt" },
      { field: "rows", numbers: [2], operator: "lte" },
    ];
    const orders = (items: readonly Rule[]): Rule[][] =>
      items.length <= 1
        ? [[...items]]
        : items.flatMap((item, index) =>
            orders([...items.slice(0, index), ...items.slice(index + 1)]).map(
              (rest) => [item, ...rest],
            ),
          );

    for (const subset of [rules.slice(0, 3), rules.slice(2)]) {
      for (const ordered of orders(subset)) {
        await expectBruteForce({ combinator: "and", rules: ordered });
      }
    }
  });

  it("composes with sorting and keyset pagination", async () => {
    expect.hasAssertions();

    const filter: Group = {
      combinator: "or",
      groups: [
        {
          combinator: "and",
          rules: [
            { field: "isChain", flag: true, operator: "is" },
            { field: "junctionCount", numbers: [1], operator: "lt" },
          ],
        },
      ],
      rules: [{ field: "strokeCount", numbers: [2], operator: "gte" }],
    };
    const sort = { direction: "DESC", field: "junctionCount" };
    const whole = await select(filter, { sort });
    const paged: string[] = [];
    let after: null | string = null;

    for (;;) {
      const body = await application.query(QUERY, {
        after,
        filter: wire(filter),
        first: 3,
        sort,
      });
      const { meanders } = pageSchema.parse(body.data);

      expect(meanders.totalCount).toBe(whole.totalCount);

      paged.push(...meanders.edges.map(({ node }) => node.code));

      if (!meanders.pageInfo.hasNextPage) {
        break;
      }

      after = meanders.pageInfo.endCursor;
    }

    expect(paged).toStrictEqual(whole.codes);
    expect(new Set(paged).size).toBe(whole.totalCount);
    expect(whole.codes.toSorted()).toStrictEqual(
      FIXTURES.filter((fixture) => matches(fixture, filter))
        .map(({ code }) => code)
        .toSorted(),
    );
  });

  const REJECTED: [string, Group, string][] = [
    [
      "an unknown field",
      only({ field: "nonsense", numbers: [1], operator: "eq" }),
      'Cannot filter by "nonsense".',
    ],
    [
      "a numeric operator on a boolean",
      only({ field: "isChain", numbers: [1], operator: "gt" }),
      'Cannot use gt on boolean field "isChain".',
    ],
    [
      "is on a number",
      only({ field: "junctionCount", flag: true, operator: "is" }),
      'Cannot use is on number field "junctionCount".',
    ],
    [
      "a between without two ordered numbers",
      only({ field: "rows", numbers: [3, 1], operator: "between" }),
      "between needs two numbers",
    ],
    [
      "a fractional shape number",
      only({ field: "rows", numbers: [1.5], operator: "eq" }),
      'Rule on "rows" needs whole numbers.',
    ],
    [
      "an operator the lattice cannot take",
      only({ field: "lattice", operator: "gt", text: "1" }),
      "The lattice takes eq or ne with a text",
    ],
    [
      "an empty group",
      { combinator: "and" },
      "needs at least one rule or group",
    ],
  ];

  it.each(REJECTED)(
    "rejects %s with a clear error",
    async (_name, filter, message) => {
      expect.hasAssertions();

      const body = await application.query(QUERY, { filter: wire(filter) });

      expect(body.errors).toHaveLength(1);
      expect(body.errors?.[0]?.message).toContain(message);
    },
  );

  it("rejects a tree nested too deep", async () => {
    expect.hasAssertions();

    let filter: Group = only({ field: "rows", numbers: [1], operator: "eq" });

    for (let level = 0; level < 7; level += 1) {
      filter = { combinator: "and", groups: [filter] };
    }

    const body = await application.query(QUERY, { filter: wire(filter) });

    expect(body.errors?.[0]?.message).toContain("nest");
  });
});
