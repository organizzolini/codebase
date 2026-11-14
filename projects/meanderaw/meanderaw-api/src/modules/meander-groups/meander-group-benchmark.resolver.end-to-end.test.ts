import { DataSource } from "typeorm";
import { describe, expect, it } from "vitest";

import {
  MeanderawDatabaseAggregatesService,
  MeanderawDatabaseService,
} from "@codebase/meanderaw-db";

import { catalogEntry } from "../../../testing/fixtures";
import { startMeanderawApplication } from "../../../testing/meanderaw-application";
import { MeandersModule } from "../meanders/meanders.module";

import { MeanderGroupsModule } from "./meander-groups.module";

const GROUPS = `query ($filter: MeanderFilterGroupInput, $groupBy: [MeanderGroupLevelInput!]!) { meanderGroups(filter: $filter, groupBy: $groupBy) { field value count } }`;
const TOTAL = `query ($filter: MeanderFilterGroupInput) { meanders(filter: $filter, first: 1) { totalCount } }`;

/** Meanders to seed; unset skips the benchmark. */
const MEANDERS = Number(process.env["MEANDERAW_BENCHMARK_MEANDERS"] ?? 0);

const rule = (
  field: string,
  operator: string,
  extra: object,
): Record<string, unknown> => ({
  field,
  operator,
  ...extra,
});
const REDUNDANT = rule("repeats", "GTE", { numbers: [1] });

/** Nests a filter where no table covers it. */
const computed = (filter: unknown): Record<string, unknown> => ({
  combinator: "AND",
  groups: filter === null ? [] : [filter],
  rules: [REDUNDANT],
});

/**
 * Opt-in: seeds MEANDERAW_BENCHMARK_MEANDERS meanders and about 3.5 bridge
 * rows each, times each covered request against the same request forced onto
 * the computed path, and prints the medians ADR 0035 quotes.
 */
describe.skipIf(MEANDERS === 0)("meander groups benchmark", () => {
  it("compares the aggregate tables with computed counts", async () => {
    const application = await startMeanderawApplication([
      MeandersModule,
      MeanderGroupsModule,
    ]);
    const database = application.database.module.get(DataSource);
    const lines: string[] = [];

    await application.database.module
      .get(MeanderawDatabaseService)
      .syncCharacteristics([
        ...["isP1", "isP2", "isP3"].map((key) =>
          catalogEntry(key, { isPattern: true }),
        ),
        ...["n1", "n2", "n3", "n4", "n5"].map((key) => catalogEntry(key)),
      ]);
    await database.query(
      `INSERT INTO meanderaw.meanders (id, code, "rows", "columns", lattice, repeats, is_hardcoded, symmetrical_codes)
       SELECT gen_random_uuid(), 'c' || i, 1 + (i % 8), 1 + ((i / 8) % 8), (i % 2)::text, 1 + (i % 3), (i % 50 = 0), ''
       FROM generate_series(1, ${MEANDERS}) i`,
    );
    // An md5 of the Code, not random(), which Postgres would evaluate once per characteristic.
    await database.query(
      `INSERT INTO meanderaw.meander_characteristics (meander_id, characteristic_id, value)
       SELECT m.id, c.id, CASE WHEN c.value_type = 'boolean' THEN 1 ELSE 1 + (('x' || substr(md5(c.key || m.code || 'v'), 1, 7))::bit(28)::int) % 6 END
       FROM meanderaw.meanders m CROSS JOIN meanderaw.characteristics c
       WHERE (('x' || substr(md5(m.code || c.key), 1, 7))::bit(28)::int % 1000) < CASE c.key WHEN 'isP1' THEN 100 WHEN 'isP2' THEN 300 WHEN 'isP3' THEN 600 ELSE 500 END`,
    );
    await database.query("ANALYZE");
    await application.database.module
      .get(MeanderawDatabaseAggregatesService)
      .rebuild();
    await database.query("ANALYZE");

    const median = async (
      run: () => Promise<unknown>,
    ): Promise<{ last: unknown; ms: number }> => {
      const times: number[] = [];
      let last: unknown;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const start = performance.now();

        last = await run();
        times.push(performance.now() - start);
      }

      return { last, ms: times.toSorted((a, b) => a - b)[2] ?? 0 };
    };
    const requests: [string, unknown, null | string[]][] = [
      ["group n1, no filter", null, ["n1"]],
      [
        "group n1 within pattern isP1",
        { combinator: "AND", rules: [rule("isP1", "IS", { flag: true })] },
        ["n1"],
      ],
      [
        "group n1 within rows = 3",
        { combinator: "AND", rules: [rule("rows", "EQ", { numbers: [3] })] },
        ["n1"],
      ],
      ["group rowsColumns, no filter", null, ["rowsColumns"]],
      [
        "total n1 < 3",
        { combinator: "AND", rules: [rule("n1", "LT", { numbers: [3] })] },
        null,
      ],
    ];

    for (const [name, filter, levels] of requests) {
      const ask = (request: unknown) => async (): Promise<unknown> => {
        const body = await application.query(levels === null ? TOTAL : GROUPS, {
          filter: request,
          groupBy: levels?.map((field) => ({ field })),
        });

        return body.data;
      };
      const covered = await median(ask(filter));
      const counted = await median(ask(computed(filter)));

      expect(covered.last).toStrictEqual(counted.last);

      lines.push(
        `${name}: tables ${covered.ms.toFixed(1)} ms, computed ${counted.ms.toFixed(1)} ms, equal`,
      );
    }

    process.stdout.write(`${MEANDERS} meanders\n${lines.join("\n")}\n`);
    await application.stop();
  }, 1_800_000);
});
