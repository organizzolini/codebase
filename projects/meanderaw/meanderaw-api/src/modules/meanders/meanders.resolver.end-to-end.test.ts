import { EntityManager } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { CodeService, DrawingService } from "@codebase/meanderaw-core";
import {
  Characteristic,
  MeanderawDatabaseService,
  MeanderCharacteristic,
} from "@codebase/meanderaw-db";

import { catalogEntry, meanderRow } from "../../../testing/fixtures";
import { GOLDEN_DOT_SVG, GOLDEN_SVG } from "../../../testing/golden-svg";
import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedMeanderaw,
  startMeanderawApplication,
} from "../../../testing/meanderaw-application";

import { MeandersModule } from "./meanders.module";

import type { MeanderawApplication } from "../../../testing/meanderaw-application";

const MEANDERS_QUERY = `query ($sort: [MeanderSortInput!], $first: Int, $after: String, $offset: Int) {
  meanders(sort: $sort, first: $first, after: $after, offset: $offset) {
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

  /** Runs the query and parses the page it returns. */
  async function page(
    variables: Record<string, unknown>,
  ): Promise<z.infer<typeof pageSchema>["meanders"]> {
    const body = await application.query(MEANDERS_QUERY, variables);

    expect(body.errors).toBeUndefined();

    return pageSchema.parse(body.data).meanders;
  }

  /** Follows `after` cursors, `first` meanders at a time, to the last page. */
  async function walk(
    sort: null | Sort,
    first: number,
    total: number = MEANDERS.length,
  ): Promise<string[]> {
    const codes: string[] = [];
    let after: null | string = null;

    for (;;) {
      const current = await page({ after, first, sort });

      expect(current.totalCount).toBe(total);

      codes.push(...current.edges.map(({ node }) => node.code));

      if (!current.pageInfo.hasNextPage) {
        return codes;
      }

      after = current.pageInfo.endCursor;
    }
  }

  /** The codes, regrouped into Code order, how a tie reads. */
  const inCodeOrder = (codes: readonly string[]): string[] => codes.toSorted();

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

  it("counts exactly before the first aggregate has run", async () => {
    expect.hasAssertions();

    const database = application.database.module.get(MeanderawDatabaseService);

    await database.saveAll([meanderRow({ code: "01x01y0" })]);

    const unaggregated = await page({ first: 10 });

    expect(unaggregated.totalCount).toBe(1);
    expect(unaggregated.edges).toHaveLength(1);

    await database.clear();
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

    expect(everything.edges).toHaveLength(6);
  });

  it("serves every meander in Code order by default, with an exact total", async () => {
    expect.hasAssertions();

    const everything = await page({ first: 200 });

    expect(everything.totalCount).toBe(6);
    expect(everything.pageInfo.hasNextPage).toBe(false);
    expect(everything.edges.map(({ node }) => node.code)).toStrictEqual(
      MEANDERS.map(({ code }) => code),
    );
    expect(everything.edges[0]?.node).toMatchObject({
      columns: 1,
      isHardcoded: true,
      repeats: 1,
      symmetricalCodes: [],
    });
  });

  it("sorts a characteristic ascending, a missing value as 0, ties by Code", async () => {
    expect.hasAssertions();

    const sorted = await walk(
      { direction: "ASC", field: "junctionCount" },
      200,
    );

    expect(sorted).toStrictEqual([
      ...inCodeOrder(["01x01y2", "01x01y5"]),
      ...inCodeOrder(["01x01y1", "01x01y4"]),
      ...inCodeOrder(["01x01y0", "01x01y3"]),
    ]);
  });

  it("sorts a characteristic descending, ties still by Code ascending", async () => {
    expect.hasAssertions();

    const sorted = await walk(
      { direction: "DESC", field: "junctionCount" },
      200,
    );

    expect(sorted).toStrictEqual([
      ...inCodeOrder(["01x01y0", "01x01y3"]),
      ...inCodeOrder(["01x01y1", "01x01y4"]),
      ...inCodeOrder(["01x01y2", "01x01y5"]),
    ]);
  });

  it("sorts a boolean pattern characteristic with a missing value as false", async () => {
    expect.hasAssertions();

    const sorted = await walk({ direction: "DESC", field: "isChain" }, 200);

    expect(sorted).toStrictEqual([
      ...inCodeOrder(["01x01y0", "01x01y3"]),
      ...inCodeOrder(["01x01y1", "01x01y2", "01x01y4", "01x01y5"]),
    ]);
  });

  it("sorts by shape fields", async () => {
    expect.hasAssertions();

    await expect(
      walk({ direction: "DESC", field: "rows" }, 200),
    ).resolves.toStrictEqual([
      "01x01y3",
      ...inCodeOrder(["01x01y0", "01x01y2", "01x01y5"]),
      ...inCodeOrder(["01x01y1", "01x01y4"]),
    ]);
    await expect(
      walk({ direction: "ASC", field: "lattice" }, 200),
    ).resolves.toStrictEqual([
      ...inCodeOrder(["01x01y0", "01x01y1", "01x01y2"]),
      ...inCodeOrder(["01x01y3", "01x01y4", "01x01y5"]),
    ]);
    await expect(
      walk({ direction: "DESC", field: "isHardcoded" }, 200),
    ).resolves.toStrictEqual([
      ...inCodeOrder(["01x01y0", "01x01y2", "01x01y4"]),
      ...inCodeOrder(["01x01y1", "01x01y3", "01x01y5"]),
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
    DATABASE_TIMEOUT_MILLISECONDS,
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

  it("refuses a cursor issued for a different sort or direction", async () => {
    expect.hasAssertions();

    const ascending = { direction: "ASC", field: "junctionCount" };
    const issued = await page({ first: 2, sort: ascending });
    const after = issued.pageInfo.endCursor;

    for (const sort of [
      { direction: "DESC", field: "junctionCount" },
      { direction: "ASC", field: "rows" },
      null,
    ]) {
      const body = await application.query(MEANDERS_QUERY, { after, sort });

      expect(body.errors?.[0]?.message).toBe(
        "The cursor was issued for a different sort.",
      );
    }

    const same = await application.query(MEANDERS_QUERY, {
      after,
      sort: ascending,
    });

    expect(same.errors).toBeUndefined();
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

  describe("characteristics", () => {
    const VALUES_QUERY =
      "query ($first: Int) { meanders(first: $first) { edges { node { code characteristics { isPattern key name value } } } } }";

    it("lists the non-zero values a meander holds by key, and none for a meander with none", async () => {
      expect.hasAssertions();

      const body = await application.query(VALUES_QUERY, { first: 6 });
      const held = new Map(
        z
          .object({
            meanders: z.object({
              edges: z.array(
                z.object({
                  node: z.object({
                    characteristics: z.array(
                      z.object({
                        isPattern: z.boolean(),
                        key: z.string(),
                        name: z.string(),
                        value: z.number(),
                      }),
                    ),
                    code: z.string(),
                  }),
                }),
              ),
            }),
          })
          .parse(body.data)
          .meanders.edges.map(({ node }) => [node.code, node.characteristics]),
      );

      expect(body.errors).toBeUndefined();
      expect(held.get("01x01y0")).toStrictEqual([
        { isPattern: true, key: "isChain", name: "isChain", value: 1 },
        {
          isPattern: false,
          key: "junctionCount",
          name: "junctionCount",
          value: 3,
        },
      ]);
      expect(held.get("01x01y1")).toStrictEqual([
        {
          isPattern: false,
          key: "junctionCount",
          name: "junctionCount",
          value: 1,
        },
      ]);
      expect(held.get("01x01y2")).toStrictEqual([]);
    });
  });

  describe("characteristics reads", () => {
    const VALUES_QUERY =
      "query ($first: Int) { meanders(first: $first) { edges { node { characteristics { key value } } } } }";

    /** How many reads of the catalog or bridge a query makes. */
    async function readsFor(first: number): Promise<number> {
      const find = vi.spyOn(EntityManager.prototype, "find");
      const body = await application.query(VALUES_QUERY, { first });
      const forCharacteristics = find.mock.calls.filter(([target]) =>
        [Characteristic, MeanderCharacteristic].includes(
          target as typeof Characteristic,
        ),
      ).length;

      find.mockRestore();

      expect(body.errors).toBeUndefined();

      return forCharacteristics;
    }

    it("reads the catalog and the bridge once per page, not once per meander", async () => {
      expect.hasAssertions();

      const small = await readsFor(1);
      const large = await readsFor(6);

      expect(small).toBe(2);
      expect(large).toBe(2);
    });
  });

  describe("svg", () => {
    const SVG_QUERY =
      "query ($first: Int) { meanders(first: $first) { edges { node { code rows columns svg } } } }";

    it("matches the drawing core makes for the same Code, as the CLI draws it", async () => {
      expect.hasAssertions();

      const body = await application.query(SVG_QUERY, { first: 6 });
      const nodes = z
        .object({
          meanders: z.object({
            edges: z.array(
              z.object({
                node: z.object({
                  code: z.string(),
                  columns: z.number(),
                  rows: z.number(),
                  svg: z.string(),
                }),
              }),
            ),
          }),
        })
        .parse(body.data)
        .meanders.edges.map(({ node }) => node);
      const codes = application.database.module.get(CodeService, {
        strict: false,
      });
      const drawings = application.database.module.get(DrawingService, {
        strict: false,
      });

      expect(body.errors).toBeUndefined();
      expect(nodes).toHaveLength(6);

      for (const { code, columns, rows, svg } of nodes) {
        expect(svg).toMatch(/^<svg /);
        expect(svg).toBe(drawings.render(codes.parse(code, rows, columns)));
      }

      expect(new Set(nodes.map(({ svg }) => svg)).size).toBeGreaterThan(1);
      expect(nodes.find(({ code }) => code === "01x01y5")?.svg).toBe(
        GOLDEN_SVG,
      );
    });

    it("draws a bare point as a filled square the width of the stroke, not as a zero-length stroke", () => {
      const codes = application.database.module.get(CodeService, {
        strict: false,
      });
      const drawings = application.database.module.get(DrawingService, {
        strict: false,
      });
      const svg = drawings.render(codes.parse("01x04y0003", 4, 1));

      expect(svg).toBe(GOLDEN_DOT_SVG);
      expect(svg).not.toMatch(/M([\d.]+) [\d.]+H\1[M"]/u);
    });

    it("repeats the tile as many times as asked, as wide as that many tiles", async () => {
      expect.hasAssertions();

      const REPEATS_QUERY =
        "query ($repeats: Int) { meanders(first: 1) { edges { node { code rows columns svg(repeats: $repeats) } } } }";
      const body = await application.query(REPEATS_QUERY, { repeats: 6 });
      const [edge] = z
        .object({
          meanders: z.object({
            edges: z.array(
              z.object({
                node: z.object({
                  code: z.string(),
                  columns: z.number(),
                  rows: z.number(),
                  svg: z.string(),
                }),
              }),
            ),
          }),
        })
        .parse(body.data).meanders.edges;
      const codes = application.database.module.get(CodeService, {
        strict: false,
      });
      const drawings = application.database.module.get(DrawingService, {
        strict: false,
      });
      const node = edge?.node;
      const one = codes.parse(node?.code ?? "", node?.rows, node?.columns);

      expect(body.errors).toBeUndefined();
      expect(node?.svg).toBe(drawings.render({ ...one, repeats: 6 }));
      expect(node?.svg).not.toBe(drawings.render(one));
    });

    it("accepts the most repeats, 24", async () => {
      expect.hasAssertions();

      const body = await application.query(
        "query { meanders(first: 1) { edges { node { svg(repeats: 24) } } } }",
      );

      expect(body.errors).toBeUndefined();
    });

    it("refuses repeats outside 1 to 24", async () => {
      expect.hasAssertions();

      const body = await application.query(
        "query { meanders(first: 1) { edges { node { svg(repeats: 25) } } } }",
      );

      expect(body.errors?.[0]?.message).toMatch(/from 1 to 24/u);
    });

    it("renders only the meanders asked for, and none when the query leaves svg out", async () => {
      expect.hasAssertions();

      const drawings = application.database.module.get(DrawingService, {
        strict: false,
      });
      const render = vi.spyOn(drawings, "render");

      await page({ first: 6 });

      expect(render).not.toHaveBeenCalled();

      const body = await application.query(SVG_QUERY, { first: 2 });

      expect(body.errors).toBeUndefined();
      expect(render).toHaveBeenCalledTimes(2);

      render.mockRestore();
    });
  });

  it("sorts by several fields in turn, ties by Code", async () => {
    expect.hasAssertions();

    const sorted = await page({
      first: 200,
      sort: [
        { direction: "DESC", field: "junctionCount" },
        { direction: "ASC", field: "rows" },
      ],
    });

    // Junction count 3 (rows 2, then 3), 1 (rows 1, 1), then 0 (rows 2, 2).
    expect(sorted.edges.map(({ node }) => node.code)).toStrictEqual([
      "01x01y0",
      "01x01y3",
      ...inCodeOrder(["01x01y1", "01x01y4"]),
      ...inCodeOrder(["01x01y2", "01x01y5"]),
    ]);
  });

  it("pages past an offset, in the order of several sorts", async () => {
    expect.hasAssertions();

    const sort = [
      { direction: "DESC", field: "junctionCount" },
      { direction: "ASC", field: "rows" },
    ];
    const everything = await page({ first: 200, sort });
    const rest = await page({ first: 2, offset: 4, sort });

    expect(rest.totalCount).toBe(6);
    expect(rest.pageInfo.hasNextPage).toBe(false);
    expect(rest.edges.map(({ node }) => node.code)).toStrictEqual(
      everything.edges.slice(4).map(({ node }) => node.code),
    );
  });

  it("takes up to eight sorts and refuses a ninth", async () => {
    expect.hasAssertions();

    const fields = [
      "rows",
      "columns",
      "lattice",
      "isHardcoded",
      "repeats",
      "junctionCount",
      "rows",
      "columns",
    ];
    const sort = fields.map((field) => ({ direction: "ASC", field }));
    const eight = await page({ first: 200, sort });
    const nine = await application.query(MEANDERS_QUERY, {
      sort: [...sort, { direction: "ASC", field: "code" }],
    });

    expect(eight.totalCount).toBe(6);
    expect(nine.errors).toHaveLength(1);
  });

  it("refuses a cursor with several sorts", async () => {
    expect.hasAssertions();

    const first = await page({ first: 1 });
    const body = await application.query(MEANDERS_QUERY, {
      after: first.pageInfo.endCursor,
      sort: [
        { direction: "ASC", field: "rows" },
        { direction: "ASC", field: "columns" },
      ],
    });

    expect(body.errors?.[0]?.message).toContain("offset");
  });

  it("breaks ties by Code, not by the order the meanders were stored in", async () => {
    expect.hasAssertions();

    const database = application.database.module.get(MeanderawDatabaseService);

    // The later Code is stored first, and is hardcoded, as the corpus is.
    await database.saveAll([
      meanderRow({ code: "01x01z9", isHardcoded: true, rows: 1 }),
    ]);
    await database.saveAll([
      meanderRow({ code: "01x01z1", isHardcoded: false, rows: 1 }),
    ]);

    const sort = [{ direction: "ASC", field: "rows" }];
    const everything = await page({ first: 200, sort });
    const ones = everything.edges
      .filter(({ node }) => node.rows === 1)
      .map(({ node }) => node.code);

    expect(ones).toStrictEqual(["01x01y1", "01x01y4", "01x01z1", "01x01z9"]);

    const walked = await walk({ direction: "ASC", field: "rows" }, 3, 8);

    expect(walked.filter((code) => ones.includes(code))).toStrictEqual(ones);
  });
});
