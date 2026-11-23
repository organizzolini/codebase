import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { catalogEntry, meanderRow } from "../../../../../testing/fixtures";
import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedMeanderaw,
  startMeanderawApplication,
} from "../../../../../testing/meanderaw-application";
import { MeandersModule } from "../../meanders.module";

import { MeanderFilterService } from "./meander-filter.service";

import type { MeanderawApplication } from "../../../../../testing/meanderaw-application";

const QUERY = `query ($filter: MeanderFilterGroupInput, $sort: [MeanderSortInput!], $first: Int, $after: String) {
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

/** 120 meanders spread over each field, many values missing. */
const FIXTURES: readonly Fixture[] = Array.from(
  { length: 120 },
  (_, index) => ({
    code: `01x${String(index).padStart(2, "0")}`,
    columns: (index % 2) + 1,
    isChain: index % 3 === 0,
    isHardcoded: index % 4 === 0,
    junctionCount: [0, 1, 3, 0, 2, 4, 1, 0][index % 8] ?? 0,
    lattice: index % 5 < 2 ? "0" : "1",
    repeats: (index % 3) + 1,
    rows: (index % 4) + 1,
    strokeCount: index % 7 < 3 ? 0 : (index % 7) - 2,
  }),
);

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

/** Nested and/or trees, `between` and negative bounds included, the same for a seed. */
function randomTrees(seed: number, count: number): Group[] {
  const random = generator(seed);
  const pick = <T>(items: readonly T[]): T =>
    items[Math.floor(random() * items.length)] as T;
  const rule = (): Rule => {
    const field = pick(["junctionCount", "strokeCount", "rows", "isChain"]);

    if (field === "isChain") {
      return { field, flag: random() < 0.5, operator: pick(["is", "is_not"]) };
    }

    if (random() < 0.25) {
      const low = Math.floor(random() * 8) - 3;

      return {
        field,
        numbers: [low, low + Math.floor(random() * 4)],
        operator: "between",
      };
    }

    return {
      field,
      numbers: [Math.floor(random() * 6) - 1],
      operator: pick(["eq", "ne", "lt", "lte", "gt", "gte"]),
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

  return Array.from({ length: count }, () => group(2));
}

/** A tree as GraphQL spells it: enum names in capitals. */
function toGraphql(group: Group): unknown {
  return {
    ...group,
    combinator: group.combinator.toUpperCase(),
    groups: group.groups?.map((child) => toGraphql(child)),
    rules: group.rules?.map((rule) => ({
      ...rule,
      operator: rule.operator.toUpperCase(),
    })),
  };
}

/** The value a field holds for a fixture, a missing one as 0 or false. */
function valueOf(fixture: Fixture, field: string): boolean | number | string {
  return fixture[field as keyof Fixture];
}

/** Sends the meanders query with a rule tree to a migrated, seeded Postgres. */
describe("meanders filter end-to-end suite", () => {
  let application: MeanderawApplication;
  let trees: Group[];

  /** The codes a tree selects, and the total the API reports for it. */
  async function select(
    filter: Group,
    extra: Record<string, unknown> = {},
  ): Promise<{ codes: string[]; totalCount: number }> {
    const body = await application.query(QUERY, {
      filter: toGraphql(filter),
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
    trees = randomTrees(2280, 60);
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

    for (const tree of trees) {
      await expectBruteForce(tree);
    }
  });

  it.each([
    ["lt", [-1]],
    ["lte", [-1]],
    ["gt", [-1]],
    ["gte", [-3]],
    ["eq", [-2]],
    ["ne", [-2]],
    ["between", [-3, -1]],
    ["between", [-1, 0]],
    ["between", [0, 0]],
    ["between", [-2, 2]],
    ["between", [1, 1]],
  ])(
    "reads a negative or zero-spanning bound exactly: %s %j",
    async (operator, numbers) => {
      expect.hasAssertions();

      await expectBruteForce(
        only({ field: "junctionCount", numbers, operator }),
      );
      await expectBruteForce({
        combinator: "and",
        rules: [
          { field: "junctionCount", numbers, operator },
          { field: "isChain", flag: true, operator: "is" },
        ],
      });
    },
  );

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
        filter: toGraphql(filter),
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
      "between takes two numbers, the lower first",
    ],
    [
      "a fractional shape number",
      only({ field: "rows", numbers: [1.5], operator: "eq" }),
      "rows takes whole numbers up to",
    ],
    [
      "a shape number past the column's range",
      only({ field: "rows", numbers: [1e30], operator: "lt" }),
      "rows takes whole numbers up to",
    ],
    [
      "a shape number one past the safe range",
      only({
        field: "columns",
        numbers: [Number.MAX_SAFE_INTEGER + 1],
        operator: "gt",
      }),
      "columns takes whole numbers up to",
    ],
    [
      "a text on a numeric rule",
      {
        combinator: "and",
        rules: [{ field: "rows", numbers: [1], operator: "eq", text: "1" }],
      },
      "eq takes exactly one number",
    ],
    [
      "a flag on a comparison",
      {
        combinator: "and",
        rules: [{ field: "rows", flag: true, numbers: [1], operator: "eq" }],
      },
      "eq does not take a flag",
    ],
    [
      "a number on a lattice comparison",
      only({ field: "lattice", numbers: [1], operator: "eq" }),
      "eq on the lattice takes only a text",
    ],
    [
      "an operator the lattice cannot take",
      only({ field: "lattice", numbers: [1], operator: "gt" }),
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

      const body = await application.query(QUERY, {
        filter: toGraphql(filter),
      });

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

    const body = await application.query(QUERY, { filter: toGraphql(filter) });

    expect(body.errors?.[0]?.message).toContain("nest");
  });

  it("accepts the largest safe whole number on a shape field", async () => {
    expect.hasAssertions();

    await expectBruteForce(
      only({
        field: "rows",
        numbers: [Number.MAX_SAFE_INTEGER],
        operator: "lt",
      }),
    );
  });

  it("refuses a tree past the size cap, and answers one at it with few parameters", async () => {
    expect.hasAssertions();

    const rule = (index: number): Rule => ({
      field: "junctionCount",
      numbers: [index % 5],
      operator: "gte",
    });
    const atCap: Group = {
      combinator: "or",
      rules: Array.from({ length: 128 }, (_, index) => rule(index)),
    };
    const pastCap: Group = {
      combinator: "or",
      rules: Array.from({ length: 129 }, (_, index) => rule(index)),
    };
    const nested: Group = {
      combinator: "and",
      groups: Array.from({ length: 70 }, () => only(rule(1))),
      rules: Array.from({ length: 70 }, (_, index) => rule(index)),
    };

    await expectBruteForce(atCap);

    for (const filter of [pastCap, nested]) {
      const body = await application.query(QUERY, {
        filter: toGraphql(filter),
      });

      expect(body.errors?.[0]?.message).toContain("128 rules and groups");
    }
  });

  it("binds a cursor to the filter it was issued for", async () => {
    expect.hasAssertions();

    const filter = only({ field: "rows", numbers: [1], operator: "gte" });
    const other = only({ field: "rows", numbers: [2], operator: "gte" });
    const first = await application.query(QUERY, {
      filter: toGraphql(filter),
      first: 3,
    });
    const after = pageSchema.parse(first.data).meanders.pageInfo.endCursor;
    const same = await application.query(QUERY, {
      after,
      filter: toGraphql(filter),
      first: 3,
    });
    const changed = await application.query(QUERY, {
      after,
      filter: toGraphql(other),
      first: 3,
    });
    const dropped = await application.query(QUERY, { after, first: 3 });

    expect(same.errors).toBeUndefined();

    for (const body of [changed, dropped]) {
      expect(body.errors?.[0]?.message).toBe(
        "The cursor was issued for a different filter.",
      );
    }
  });

  describe("plan", () => {
    /** The compiled SQL and parameters for a tree, as the service plans it. */
    async function plan(
      tree: Group,
    ): Promise<{ parameters: Record<string, unknown>; where: string }> {
      return application.database.module
        .get(MeanderFilterService, { strict: false })
        .compile(tree);
    }

    /** A characteristic's catalog id. */
    async function idOf(key: string): Promise<number> {
      const rows: { id: number }[] = await application.database.module
        .get(DataSource, { strict: false })
        .query("SELECT id FROM characteristics WHERE key = $1", [key]);

      return rows[0]?.id ?? -1;
    }

    it("starts a flat AND from an index range on its most selective rule", async () => {
      expect.hasAssertions();

      const planned = await plan({
        combinator: "and",
        rules: [
          { field: "junctionCount", numbers: [0], operator: "gt" },
          { field: "isChain", flag: true, operator: "is" },
          { field: "strokeCount", numbers: [4], operator: "gte" },
          { field: "rows", numbers: [3], operator: "lte" },
        ],
      });
      const ranges = planned.where
        .split(" AND ")
        .filter((part) => part.includes("IN (SELECT"));
      const bound = /"characteristic_id" = :(\w+)/.exec(ranges[0] ?? "")?.[1];

      expect(ranges).toHaveLength(1);
      expect(planned.parameters[bound ?? ""]).toBe(await idOf("strokeCount"));
      expect(planned.where).toContain("COALESCE");
      expect(planned.where).not.toMatch(/FROM "meander_characteristics"/);
      expect(planned.where).toMatch(/FROM "\w+"\."meander_characteristics"/);
    });

    it("probes an OR, a nested tree, and rules a missing row satisfies", async () => {
      expect.hasAssertions();

      const rare: Rule = {
        field: "strokeCount",
        numbers: [4],
        operator: "gte",
      };

      for (const tree of [
        { combinator: "or", rules: [rare, rare] } as Group,
        { combinator: "and", groups: [only(rare)], rules: [rare] } as Group,
        only({ field: "strokeCount", numbers: [4], operator: "lt" }),
      ]) {
        const planned = await plan(tree);

        expect(planned.where).not.toContain("IN (SELECT");
      }
    });
  });
});
