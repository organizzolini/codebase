import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  type DatabaseTestingModule,
  startDatabaseTestingModule,
} from "@codebase/persistence/testing";

import { characteristicRecords } from "../../../../../testing/characteristics";
import { meanderRecord } from "../../../../../testing/meanders";
import { MEANDERAW_DATABASE_MIGRATIONS } from "../../data-source.constants";
import { DatabaseModule } from "../../database.module";
import { DatabaseService } from "../../database.service";
import { Meander } from "../meander/meander.entity";

import { MeanderawDatabaseAggregatesService } from "./meanderaw-database-aggregates.service";

import type { DataSource } from "typeorm";

// 🧪 Tests

/** Five meanders in two shapes, giving every table rows to name. */
const MEANDERS = [
  meanderRecord({
    characteristics: { cornerCount: 2, isA: true },
    code: "c1",
    columns: 1,
    lattice: "0",
    rows: 2,
  }),
  meanderRecord({
    characteristics: { cornerCount: 3, isA: true, isB: true },
    code: "c2",
    columns: 1,
    lattice: "0",
    rows: 2,
  }),
  meanderRecord({
    characteristics: { cornerCount: 2 },
    code: "c3",
    columns: 1,
    lattice: "0",
    rows: 2,
  }),
  meanderRecord({
    characteristics: { density: 0.5, isB: true },
    code: "c4",
    columns: 1,
    lattice: "1",
    rows: 3,
  }),
  meanderRecord({ code: "c5", columns: 1, lattice: "1", rows: 3 }),
];

/**
 * Drives `MeanderawDatabaseAggregatesService` against a throwaway Postgres
 * container: the rows each count table holds after a rebuild, and what a
 * failed rebuild leaves behind.
 */
describe(MeanderawDatabaseAggregatesService, () => {
  let database: DatabaseTestingModule;
  let dataSource: DataSource;
  let aggregates: MeanderawDatabaseAggregatesService;
  let service: DatabaseService;

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: DatabaseModule,
      entities: [Meander],
      migrations: [...MEANDERAW_DATABASE_MIGRATIONS],
      project: "meanderaw",
    });

    aggregates = database.module.get(MeanderawDatabaseAggregatesService);
    dataSource = database.dataSource;
    service = database.module.get(DatabaseService);
  });

  beforeEach(async () => {
    await service.clear();
    await service.syncCharacteristics(
      characteristicRecords([
        "cornerCount",
        "density",
        "isA",
        "isB",
        "isReducible",
      ]),
    );
    await service.saveAll(MEANDERS);
  });

  afterAll(async () => {
    await database.close();
  });

  /** A count table's rows as sorted `|`-joined lines, keyed by characteristic. */
  const rowsOf = async (table: string, select: string): Promise<string[]> => {
    const rows: { line: string }[] = await dataSource.query(
      `SELECT ${select} AS line FROM meanderaw.${table} counts
       LEFT JOIN meanderaw.characteristics first ON first.id = counts.characteristic_id
       LEFT JOIN meanderaw.characteristics other ON other.id = ${table === "characteristic_pair_counts" ? "counts.other_characteristic_id" : "NULL"}`,
    );

    return rows.map(({ line }) => line).toSorted();
  };

  describe("rebuild", () => {
    it("counts the meanders holding each characteristic at each value, leaving the 0 or false bucket out", async () => {
      await aggregates.rebuild();

      await expect(
        rowsOf(
          "characteristic_value_counts",
          "first.key || '|' || counts.value || '|' || counts.meander_count",
        ),
      ).resolves.toStrictEqual([
        "cornerCount|2|2",
        "cornerCount|3|1",
        "density|0.5|1",
        "isA|1|2",
        "isB|1|2",
      ]);
    });

    it("crosses each true boolean with every characteristic its meanders hold", async () => {
      await aggregates.rebuild();

      await expect(
        rowsOf(
          "characteristic_pair_counts",
          "first.key || '|' || counts.value || '|' || other.key || '|' || counts.other_value || '|' || counts.meander_count",
        ),
      ).resolves.toStrictEqual([
        "isA|1|cornerCount|2|1",
        "isA|1|cornerCount|3|1",
        "isA|1|isA|1|2",
        "isA|1|isB|1|1",
        "isB|1|cornerCount|3|1",
        "isB|1|density|0.5|1",
        "isB|1|isA|1|1",
        "isB|1|isB|1|2",
      ]);
    });

    it("counts each shape's meanders in all, and holding each characteristic at each value", async () => {
      await aggregates.rebuild();

      await expect(
        dataSource.query<unknown[]>(
          `SELECT rows::int, columns::int, meander_count::int AS count FROM meanderaw.shape_counts ORDER BY rows`,
        ),
      ).resolves.toStrictEqual([
        { columns: 1, count: 3, rows: 2 },
        { columns: 1, count: 2, rows: 3 },
      ]);
      await expect(
        rowsOf(
          "characteristic_shape_counts",
          "counts.rows || '|' || first.key || '|' || counts.value || '|' || counts.meander_count",
        ),
      ).resolves.toStrictEqual([
        "2|cornerCount|2|2",
        "2|cornerCount|3|1",
        "2|isA|1|2",
        "2|isB|1|1",
        "3|density|0.5|1",
        "3|isB|1|1",
      ]);
    });

    it("keeps one row per rows and columns, however many lattices the meanders have", async () => {
      await service.save(meanderRecord({ code: "c7", lattice: "7", rows: 2 }));
      await service.save(meanderRecord({ code: "c8", lattice: "8", rows: 2 }));
      await aggregates.rebuild();

      await expect(
        dataSource.query<unknown[]>(
          `SELECT rows::int, columns::int, meander_count::int AS count FROM meanderaw.shape_counts ORDER BY rows`,
        ),
      ).resolves.toStrictEqual([
        { columns: 1, count: 5, rows: 2 },
        { columns: 1, count: 2, rows: 3 },
      ]);
    });

    it("lets a reader derive the 0 or false bucket as the shape total minus the stored rows", async () => {
      await aggregates.rebuild();

      const [{ absent }]: [{ absent: number }] = await dataSource.query(
        `SELECT (SELECT SUM(meander_count) FROM meanderaw.shape_counts)::int
              - (SELECT SUM(counts.meander_count) FROM meanderaw.characteristic_value_counts counts
                 JOIN meanderaw.characteristics catalog ON catalog.id = counts.characteristic_id
                 WHERE catalog.key = 'isA')::int AS absent`,
      );

      expect(absent).toBe(3);
    });

    it("sets each characteristic's meanderCount to the meanders holding it", async () => {
      await aggregates.rebuild();

      const catalog: { key: string; meanderCount: string }[] =
        await dataSource.query(
          `SELECT key, meander_count AS "meanderCount" FROM meanderaw.characteristics ORDER BY key`,
        );

      expect(
        catalog.map(({ key, meanderCount }) => `${key}=${meanderCount}`),
      ).toStrictEqual([
        "cornerCount=3",
        "density=1",
        "isA=2",
        "isB=2",
        "isReducible=0",
      ]);
    });

    it("replaces what an earlier rebuild counted rather than adding to it", async () => {
      await aggregates.rebuild();
      await dataSource.query(
        `DELETE FROM meanderaw.meanders WHERE code IN ('c1', 'c2')`,
      );
      await aggregates.rebuild();

      await expect(
        rowsOf(
          "characteristic_value_counts",
          "first.key || '|' || counts.value || '|' || counts.meander_count",
        ),
      ).resolves.toStrictEqual(["cornerCount|2|1", "density|0.5|1", "isB|1|1"]);
    });

    it("leaves each table its own name and primary key, so the schema still matches the migrations", async () => {
      await aggregates.rebuild();

      const keys: { name: string }[] = await dataSource.query(
        `SELECT constraint_name AS name FROM information_schema.table_constraints
         WHERE constraint_type = 'PRIMARY KEY' AND table_schema = 'meanderaw' AND table_name LIKE '%counts'
         ORDER BY constraint_name`,
      );

      expect(keys.map(({ name }) => name)).toStrictEqual([
        "PK_characteristic_pair_counts",
        "PK_characteristic_shape_counts",
        "PK_characteristic_value_counts",
        "PK_shape_counts",
      ]);
    });

    it("leaves every table as it was when the rebuild fails part way, so a reader never sees a half-built swap", async () => {
      await aggregates.rebuild();
      await dataSource.query(
        `CREATE TABLE meanderaw.shape_counts_next (blocker int)`,
      );
      await service.clear();

      await expect(aggregates.rebuild()).rejects.toThrow(/shape_counts_next/);

      await dataSource.query(`DROP TABLE meanderaw.shape_counts_next`);

      await expect(
        rowsOf(
          "characteristic_value_counts",
          "first.key || '|' || counts.value || '|' || counts.meander_count",
        ),
      ).resolves.toHaveLength(5);
      await expect(
        dataSource.query<unknown[]>(
          `SELECT COUNT(*)::int AS count FROM meanderaw.shape_counts`,
        ),
      ).resolves.toStrictEqual([{ count: 2 }]);
    });
  });

  describe("marker", () => {
    /** The marker's meander counts: none when it is absent. */
    const markers = async (): Promise<unknown[]> =>
      await dataSource.query(
        "SELECT meander_count::int AS count FROM meanderaw.aggregate_markers",
      );

    it("is written by a rebuild with the meanders it counted, and replaced by the next", async () => {
      await expect(markers()).resolves.toStrictEqual([]);

      await aggregates.rebuild();

      await expect(markers()).resolves.toStrictEqual([{ count: 5 }]);

      await service.save(meanderRecord({ code: "c6", lattice: "2" }));
      await aggregates.rebuild();

      await expect(markers()).resolves.toStrictEqual([{ count: 6 }]);
    });

    it.each([
      [
        "save",
        async (): Promise<void> => {
          await service.save(meanderRecord({ code: "m1" }));
        },
      ],
      [
        "saveAll",
        async (): Promise<void> => {
          await service.saveAll([meanderRecord({ code: "m2" })]);
        },
      ],
      [
        "syncCharacteristics",
        async (): Promise<void> => {
          await service.syncCharacteristics(characteristicRecords(["isA"]));
        },
      ],
      [
        "clear",
        async (): Promise<void> => {
          await service.clear();
        },
      ],
    ])(
      "is deleted by %s, so no reader trusts counts it has outdated",
      async (_name, write) => {
        await aggregates.rebuild();
        await write();

        await expect(markers()).resolves.toStrictEqual([]);
      },
    );

    it("is not written when the rebuild fails", async () => {
      await dataSource.query(
        `CREATE TABLE meanderaw.shape_counts_next (blocker int)`,
      );

      await expect(aggregates.rebuild()).rejects.toThrow(/shape_counts_next/);

      await dataSource.query(`DROP TABLE meanderaw.shape_counts_next`);

      await expect(markers()).resolves.toStrictEqual([]);
    });
  });
});
