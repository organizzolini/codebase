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

const MEANDERS_QUERY = `query ($sort: MeanderSortInput, $first: Int, $after: String) {
  meanders(sort: $sort, first: $first, after: $after) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges { cursor node { id code rows columns lattice repeats isHardcoded symmetricalCodes } }
  }
}`;

const pageSchema = z.object({
  meanders: z.object({
    edges: z.array(
      z.object({
        cursor: z.string(),
        node: z.object({
          code: z.string(),
          columns: z.number(),
          id: z.string(),
          isHardcoded: z.boolean(),
          lattice: z.string(),
          repeats: z.number(),
          rows: z.number(),
          symmetricalCodes: z.array(z.string()),
        }),
      }),
    ),
    pageInfo: z.object({
      endCursor: z.string().nullable(),
      hasNextPage: z.boolean(),
    }),
    totalCount: z.number(),
  }),
});

interface Sort {
  readonly direction: "ASC" | "DESC";
  readonly field: string;
}

/** Six meanders whose characteristic values and shapes tie in pairs. */
const MEANDERS = [
  { code: "01x01y0", junctions: 3, rows: 2 },
  { code: "01x01y1", junctions: 1, rows: 1 },
  { code: "01x01y2", rows: 2 },
  { code: "01x01y3", junctions: 3, rows: 3 },
  { code: "01x01y4", junctions: 1, rows: 1 },
  { code: "01x01y5", rows: 2 },
] as const;

/** Sends the meanders query over HTTP to a migrated, seeded Postgres. */
describe("meanders resolver end-to-end suite", () => {
  let application: MeanderawApplication;
  let idOrder: string[];

  /** Runs the query and parses the page it returns. */
  async function page(
    variables: Record<string, unknown>,
  ): Promise<z.infer<typeof pageSchema>["meanders"]> {
    const body = await application.query(MEANDERS_QUERY, variables);

    expect(body.errors).toBeUndefined();

    return pageSchema.parse(body.data).meanders;
  }

  /** Follows `after` cursors, `first` meanders at a time, to the last page. */
  async function walk(sort: null | Sort, first: number): Promise<string[]> {
    const codes: string[] = [];
    let after: null | string = null;

    for (;;) {
      const current = await page({ after, first, sort });

      expect(current.totalCount).toBe(MEANDERS.length);

      codes.push(...current.edges.map(({ node }) => node.code));

      if (!current.pageInfo.hasNextPage) {
        return codes;
      }

      after = current.pageInfo.endCursor;
    }
  }

  /** The codes in `id` order, regrouped so equal values stay in id order. */
  const inIdOrder = (codes: readonly string[]): string[] =>
    codes.toSorted(
      (left, right) => idOrder.indexOf(left) - idOrder.indexOf(right),
    );

  beforeAll(async () => {
    application = await startMeanderawApplication([MeandersModule]);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("serves an empty page, and a total of 0, before any draw run", async () => {
    expect.hasAssertions();

    const empty = await page({ after: null });

    expect(empty.edges).toStrictEqual([]);
    expect(empty.totalCount).toBe(0);
    expect(empty.pageInfo.hasNextPage).toBe(false);
  });

  it("seeds the meanders the rest of the suite reads", async () => {
    expect.hasAssertions();

    await seedMeanderaw(
      application.database,
      [
        catalogEntry("junctionCount"),
        catalogEntry("isChain", { isPattern: true }),
      ],
      MEANDERS.map((meander, index) =>
        meanderRow({
          characteristics: {
            ...("junctions" in meander
              ? { junctionCount: meander.junctions }
              : {}),
            ...(index === 0 || index === 3 ? { isChain: true } : {}),
          },
          code: meander.code,
          isHardcoded: index % 2 === 0,
          lattice: index < 3 ? "0" : "1",
          rows: meander.rows,
        }),
      ),
    );
    const everything = await page({ first: 200 });

    idOrder = everything.edges.map(({ node }) => node.code);

    expect(idOrder).toHaveLength(6);
  });

  it("serves every meander in id order by default, with an exact total", async () => {
    expect.hasAssertions();

    const everything = await page({ first: 200 });

    expect(everything.totalCount).toBe(6);
    expect(everything.pageInfo.hasNextPage).toBe(false);
    expect(idOrder).toHaveLength(6);
    expect(everything.edges.map(({ node }) => node.id)).toStrictEqual(
      everything.edges.map(({ node }) => node.id).toSorted(),
    );
    expect(everything.edges[0]?.node).toMatchObject({
      columns: 1,
      isHardcoded: true,
      repeats: 1,
      symmetricalCodes: [],
    });
  });

  it("sorts a characteristic ascending, a missing value as 0, ties by id", async () => {
    expect.hasAssertions();

    const sorted = await walk(
      { direction: "ASC", field: "junctionCount" },
      200,
    );

    expect(sorted).toStrictEqual([
      ...inIdOrder(["01x01y2", "01x01y5"]),
      ...inIdOrder(["01x01y1", "01x01y4"]),
      ...inIdOrder(["01x01y0", "01x01y3"]),
    ]);
  });

  it("sorts a characteristic descending, ties still by id ascending", async () => {
    expect.hasAssertions();

    const sorted = await walk(
      { direction: "DESC", field: "junctionCount" },
      200,
    );

    expect(sorted).toStrictEqual([
      ...inIdOrder(["01x01y0", "01x01y3"]),
      ...inIdOrder(["01x01y1", "01x01y4"]),
      ...inIdOrder(["01x01y2", "01x01y5"]),
    ]);
  });

  it("sorts a boolean pattern characteristic with a missing value as false", async () => {
    expect.hasAssertions();

    const sorted = await walk({ direction: "DESC", field: "isChain" }, 200);

    expect(sorted).toStrictEqual([
      ...inIdOrder(["01x01y0", "01x01y3"]),
      ...inIdOrder(["01x01y1", "01x01y2", "01x01y4", "01x01y5"]),
    ]);
  });

  it("sorts by shape fields", async () => {
    expect.hasAssertions();

    await expect(
      walk({ direction: "DESC", field: "rows" }, 200),
    ).resolves.toStrictEqual([
      "01x01y3",
      ...inIdOrder(["01x01y0", "01x01y2", "01x01y5"]),
      ...inIdOrder(["01x01y1", "01x01y4"]),
    ]);
    await expect(
      walk({ direction: "ASC", field: "lattice" }, 200),
    ).resolves.toStrictEqual([
      ...inIdOrder(["01x01y0", "01x01y1", "01x01y2"]),
      ...inIdOrder(["01x01y3", "01x01y4", "01x01y5"]),
    ]);
    await expect(
      walk({ direction: "DESC", field: "isHardcoded" }, 200),
    ).resolves.toStrictEqual([
      ...inIdOrder(["01x01y0", "01x01y2", "01x01y4"]),
      ...inIdOrder(["01x01y1", "01x01y3", "01x01y5"]),
    ]);
    await expect(
      walk({ direction: "DESC", field: "code" }, 200),
    ).resolves.toStrictEqual(MEANDERS.map(({ code }) => code).toReversed());
  });

  it.each([1, 2, 4])(
    "pages %i at a time without skipping or repeating a meander, whatever the sort",
    async (size) => {
      expect.hasAssertions();

      for (const sort of [
        null,
        { direction: "ASC", field: "junctionCount" },
        { direction: "DESC", field: "junctionCount" },
        { direction: "DESC", field: "isChain" },
        { direction: "ASC", field: "rows" },
        { direction: "DESC", field: "lattice" },
        { direction: "ASC", field: "isHardcoded" },
        { direction: "DESC", field: "code" },
      ] as const) {
        const paged = await walk(sort, size);
        const whole = await walk(sort, 200);

        expect(paged).toStrictEqual(whole);
        expect(new Set(paged).size).toBe(6);
      }
    },
  );

  it("reports whether another page follows, and hands out a cursor per edge", async () => {
    expect.hasAssertions();

    const first = await page({ first: 4 });
    const last = await page({ after: first.pageInfo.endCursor, first: 4 });

    expect(first.edges).toHaveLength(4);
    expect(first.pageInfo.hasNextPage).toBe(true);
    expect(first.pageInfo.endCursor).toBe(first.edges.at(-1)?.cursor);
    expect(last.edges).toHaveLength(2);
    expect(last.pageInfo.hasNextPage).toBe(false);
  });

  it("refuses a sort field that is neither a shape field nor a characteristic", async () => {
    expect.hasAssertions();

    const body = await application.query(MEANDERS_QUERY, {
      sort: { direction: "ASC", field: "nonsense" },
    });

    expect(body.errors?.[0]?.message).toBe('Cannot sort by "nonsense".');
  });

  it("refuses a cursor it did not issue and a page size out of range", async () => {
    expect.hasAssertions();

    const cursor = await application.query(MEANDERS_QUERY, {
      after: "not-a-cursor",
    });
    const none = await application.query(MEANDERS_QUERY, { first: 0 });
    const huge = await application.query(MEANDERS_QUERY, { first: 201 });

    expect(cursor.errors?.[0]?.message).toBe("The cursor is not valid.");
    expect(none.errors).toHaveLength(1);
    expect(huge.errors).toHaveLength(1);
  });
});
