import { type DataSource, Like, type Repository } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  type DatabaseTestingModule,
  startDatabaseTestingModule,
} from "@codebase/persistence/testing";

import {
  characteristicRecord,
  characteristicRecords,
} from "../../../testing/characteristics";
import { meanderRecord } from "../../../testing/meanders";

import { MEANDERAW_DATABASE_MIGRATIONS } from "./data-source.constants";
import { Characteristic } from "./entities/characteristic.entity";
import { Meander } from "./entities/meander.entity";
import {
  MEANDER_INSERT_CHUNK_SIZE,
  UnknownCharacteristicError,
} from "./meanderaw-database.constants";
import { MeanderawDatabaseModule } from "./meanderaw-database.module";
import { MeanderawDatabaseService } from "./meanderaw-database.service";

import type { MeanderRecord } from "./meanderaw-database.types";

// 🧪 Tests

/**
 * Drives `MeanderawDatabaseService` against a real TypeORM connection to a throwaway
 * Postgres container, per spec #813's Testing Decisions: this is the highest
 * seam, and it asserts on persisted rows rather than on a mocked repository.
 *
 * The module is booted by `startDatabaseTestingModule`, which points
 * `MeanderawDatabaseModule` at a fresh, isolated database of its own
 * instead of the local one.
 */
/** Names that must never be columns: they live in the bridge. */
const CHARACTERISTIC_NAMES = [
  "cornerCount",
  "dotCount",
  "edgeCount",
  "forkCount",
];

/** The catalog these cases hold, registered before each. */
const CATALOG_KEYS = [
  "aSoutheastLatinCount",
  "bettiNumber0Count",
  "crossCount",
  "density",
  "forkCount",
  "isDots",
  "isReducible",
  "isSnake",
  "northForkCount",
  "oSoutheastLatinCount",
  "yuSoutheastHangulCount",
];

describe(MeanderawDatabaseService, () => {
  let database: DatabaseTestingModule;
  let dataSource: DataSource;
  let repository: Repository<Meander>;
  let service: MeanderawDatabaseService;

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: MeanderawDatabaseModule,
      entities: [Meander],
      migrations: [...MEANDERAW_DATABASE_MIGRATIONS],
      project: "meanderaw",
    });

    service = await database.module.resolve(MeanderawDatabaseService);
    dataSource = database.dataSource;
    repository = database.repository(Meander);
  });

  beforeEach(async () => {
    await service.syncCharacteristics(characteristicRecords(CATALOG_KEYS));
  });

  afterAll(async () => {
    await database.close();
  });

  /** One meander's bridge rows as `key=value` strings, sorted. */
  const bridgeOf = async (code: string): Promise<string[]> => {
    const rows: { key: string; value: number }[] = await dataSource.query(
      `SELECT catalog.key, bridge.value
       FROM meanderaw.meander_characteristics bridge
       JOIN meanderaw.characteristics catalog ON catalog.id = bridge.characteristic_id
       JOIN meanderaw.meanders meander ON meander.id = bridge.meander_id
       WHERE meander.code = $1`,
      [code],
    );

    return rows.map(({ key, value }) => `${key}=${value}`).toSorted();
  };

  describe("save", () => {
    it("persists a meander row with every field it was given", async () => {
      const saved = await service.save(
        meanderRecord({
          characteristics: {
            bettiNumber0Count: 1,
            density: 0.5,
            forkCount: 1,
            isSnake: true,
          },
          code: "3c9a",
          columns: 2,
          lattice: "3c9a",
          rows: 3,
        }),
      );

      const row = await repository.findOneByOrFail({ id: saved.id });

      expect(row).toMatchObject({
        code: "3c9a",
        columns: 2,
        id: saved.id,
        isHardcoded: true,
        lattice: "3c9a",
        rows: 3,
      });
      await expect(bridgeOf("3c9a")).resolves.toStrictEqual([
        "bettiNumber0Count=1",
        "density=0.5",
        "forkCount=1",
        "isSnake=1",
      ]);
    });

    it("assigns each saved row its own uuidv7 id, ordered by when it was written", async () => {
      const first = await service.save(meanderRecord({ code: "0" }));
      const second = await service.save(meanderRecord({ code: "f" }));

      expect(first.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
      );
      expect([second.id, first.id].toSorted()).toStrictEqual([
        first.id,
        second.id,
      ]);
    });

    it("refuses a second row with a code already committed, since code is the meander's whole identity", async () => {
      await service.save(meanderRecord({ code: "duplicate-code" }));

      await expect(
        service.save(meanderRecord({ code: "duplicate-code" })),
      ).rejects.toThrow(/UNIQUE constraint/i);
    });
  });

  describe("characteristics", () => {
    it("stores no Characteristic under a column of its own, nor the retired jsonb map", () => {
      const columns = new Set(
        dataSource
          .getMetadata(Meander)
          .columns.map((column) => column.propertyName),
      );

      expect(
        CHARACTERISTIC_NAMES.filter((key) => columns.has(key)),
      ).toStrictEqual([]);
      expect(columns.has("characteristics")).toBe(false);
    });

    it("writes one bridge row per number above 0 and per true boolean, a boolean as 1", async () => {
      await service.save(
        meanderRecord({
          characteristics: {
            aSoutheastLatinCount: 2,
            crossCount: 1,
            density: 0.25,
            isReducible: true,
            isSnake: true,
            yuSoutheastHangulCount: 1,
          },
          code: "bridge-round-trip",
          lattice: "bridge-round-trip",
        }),
      );

      await expect(bridgeOf("bridge-round-trip")).resolves.toStrictEqual([
        "aSoutheastLatinCount=2",
        "crossCount=1",
        "density=0.25",
        "isReducible=1",
        "isSnake=1",
        "yuSoutheastHangulCount=1",
      ]);
    });

    it("writes no bridge row for a meander holding nothing", async () => {
      await service.save(
        meanderRecord({ code: "bridge-empty", lattice: "bridge-empty" }),
      );

      await expect(bridgeOf("bridge-empty")).resolves.toStrictEqual([]);
    });

    it("writes the bridge rows of every chunk, each meander keeping its own", async () => {
      const records = Array.from(
        { length: MEANDER_INSERT_CHUNK_SIZE + 1 },
        (_row, index) =>
          meanderRecord({
            characteristics: { oSoutheastLatinCount: index + 1 },
            code: `bridge-chunk-${index}`,
            lattice: `bridge-chunk-${index}`,
          }),
      );

      await service.saveAll(records);
      const rows: { code: string; value: number }[] = await dataSource.query(
        `SELECT meander.code, bridge.value
         FROM meanderaw.meander_characteristics bridge
         JOIN meanderaw.meanders meander ON meander.id = bridge.meander_id
         WHERE meander.code LIKE 'bridge-chunk-%'`,
      );

      expect(rows).toHaveLength(records.length);
      expect(
        rows.every(
          ({ code, value }) => value === Number(code.split("-")[2]) + 1,
        ),
      ).toBe(true);
    });

    it("refuses a meander holding a characteristic the catalog lacks, and writes none of it", async () => {
      await expect(
        service.save(
          meanderRecord({
            characteristics: { unregisteredCount: 1 },
            code: "bridge-unknown",
            lattice: "bridge-unknown",
          }),
        ),
      ).rejects.toThrow(UnknownCharacteristicError);
      await expect(
        service.saveAll([
          meanderRecord({
            characteristics: { unregisteredCount: 1 },
            code: "bridge-unknown-batch",
            lattice: "bridge-unknown-batch",
          }),
        ]),
      ).rejects.toThrow(/no catalog row/u);
      await expect(
        repository.countBy({ code: Like("bridge-unknown%") }),
      ).resolves.toBe(0);
    });

    it("refuses a bridge row holding 0 or less, since only values above 0 are stored", async () => {
      const saved = await service.save(
        meanderRecord({ code: "bridge-check", lattice: "bridge-check" }),
      );
      const insert = async (value: number): Promise<unknown> =>
        dataSource.query(
          `INSERT INTO meanderaw.meander_characteristics (meander_id, characteristic_id, value)
           SELECT $1, id, $2 FROM meanderaw.characteristics WHERE key = 'crossCount'`,
          [saved.id, value],
        );

      await expect(insert(0)).rejects.toThrow(/check constraint/iu);
      await expect(insert(-1)).rejects.toThrow(/check constraint/iu);
    });
  });

  describe("syncCharacteristics", () => {
    it("registers every entry once, however many times it syncs", async () => {
      await service.syncCharacteristics(characteristicRecords(CATALOG_KEYS));
      await service.syncCharacteristics(characteristicRecords(CATALOG_KEYS));

      const registered = await dataSource.getRepository(Characteristic).find();
      const keys = registered.map(({ key }) => key).toSorted();

      expect(keys).toStrictEqual(CATALOG_KEYS.toSorted());
    });

    it("rewrites an entry's description in place, keeping its id", async () => {
      const before = await dataSource
        .getRepository(Characteristic)
        .findOneByOrFail({ key: "crossCount" });

      await service.syncCharacteristics([
        ...characteristicRecords(
          CATALOG_KEYS.filter((key) => key !== "crossCount"),
        ),
        characteristicRecord("crossCount", {
          description: "Rewritten.",
          formula: "n",
          isPattern: true,
        }),
      ]);

      await expect(
        dataSource
          .getRepository(Characteristic)
          .findOneByOrFail({ key: "crossCount" }),
      ).resolves.toMatchObject({
        description: "Rewritten.",
        formula: "n",
        id: before.id,
        isPattern: true,
      });
    });

    it("deletes an entry no longer registered, and the bridge rows that held it", async () => {
      await service.save(
        meanderRecord({
          characteristics: { crossCount: 3, forkCount: 1 },
          code: "sync-stale",
          lattice: "sync-stale",
        }),
      );

      await service.syncCharacteristics(
        characteristicRecords(
          CATALOG_KEYS.filter((key) => key !== "crossCount"),
        ),
      );

      await expect(bridgeOf("sync-stale")).resolves.toStrictEqual([
        "forkCount=1",
      ]);
      await expect(
        dataSource.getRepository(Characteristic).countBy({ key: "crossCount" }),
      ).resolves.toBe(0);
    });
  });

  describe("codes", () => {
    it("reads the Codes one shape's rows hold, and no other shape's", async () => {
      await service.saveAll([
        meanderRecord({ code: "codes-a", columns: 7, lattice: "a", rows: 9 }),
        meanderRecord({ code: "codes-b", columns: 7, lattice: "b", rows: 9 }),
        meanderRecord({ code: "codes-c", columns: 6, lattice: "c", rows: 9 }),
      ]);

      await expect(
        service.codes({ columns: 7, rows: 9 }),
      ).resolves.toStrictEqual(new Set(["codes-a", "codes-b"]));
    });
  });

  describe("saveAll", () => {
    it("writes more rows than one chunk holds, every column bound, without exceeding the driver's variable limit", async () => {
      const records = Array.from(
        { length: MEANDER_INSERT_CHUNK_SIZE * 2 + 1 },
        (_row, index) =>
          meanderRecord({ code: `save-all-${index}`, lattice: `${index}` }),
      );

      await expect(service.saveAll(records)).resolves.toBe(records.length);
      await expect(
        repository.countBy({ code: Like("save-all-%") }),
      ).resolves.toBe(records.length);
    });

    it("stores every column and bridge row exactly as save would, the array column included", async () => {
      const fields: Partial<MeanderRecord> = {
        characteristics: { aSoutheastLatinCount: 2, crossCount: 1 },
        symmetricalCodes: ["01x02y12", "01x02y21"],
      };

      await service.save(meanderRecord({ ...fields, code: "saved-one" }));
      await service.saveAll([
        meanderRecord({ ...fields, code: "saved-all", lattice: "saved-all" }),
      ]);

      const {
        code: _one,
        createdAt: _oneCreated,
        id: _oneId,
        updatedAt: _oneUpdated,
        ...one
      } = await repository.findOneByOrFail({ code: "saved-one" });
      const {
        code: _all,
        createdAt: _allCreated,
        id: _allId,
        lattice: _lattice,
        updatedAt: _allUpdated,
        ...all
      } = await repository.findOneByOrFail({ code: "saved-all" });
      const { lattice: _oneLattice, ...comparable } = one;

      expect(all).toStrictEqual(comparable);
      await expect(bridgeOf("saved-all")).resolves.toStrictEqual(
        await bridgeOf("saved-one"),
      );
    });

    it("refuses a batch holding a duplicate code and writes none of it", async () => {
      const records = [
        meanderRecord({ code: "batch-first", lattice: "batch-first" }),
        meanderRecord({ code: "batch-second", lattice: "batch-second" }),
        meanderRecord({ code: "batch-first", lattice: "batch-third" }),
      ];

      await expect(service.saveAll(records)).rejects.toThrow(
        /UNIQUE constraint/i,
      );
      await expect(repository.countBy({ code: Like("batch-%") })).resolves.toBe(
        0,
      );
    });
  });

  describe("clear", () => {
    it("deletes every meander row, so a regenerated draw run writes the same codes again rather than colliding with them", async () => {
      await service.save(
        meanderRecord({
          characteristics: { crossCount: 1 },
          code: "clear-first-row",
        }),
      );
      await service.save(meanderRecord({ code: "clear-second-row" }));

      await service.clear();

      await expect(repository.find()).resolves.toStrictEqual([]);
      await expect(
        dataSource.query<unknown[]>(
          "SELECT 1 FROM meanderaw.meander_characteristics",
        ),
      ).resolves.toStrictEqual([]);
      await expect(
        dataSource.getRepository(Characteristic).count(),
      ).resolves.toBe(CATALOG_KEYS.length);
      await expect(
        service.save(meanderRecord({ code: "clear-first-row" })),
      ).resolves.toMatchObject({ code: "clear-first-row" });
    });
  });
});
