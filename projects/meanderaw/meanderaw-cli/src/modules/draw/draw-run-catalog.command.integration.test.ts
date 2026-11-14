import { createMock } from "@golevelup/ts-vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { storedCharacteristics } from "../../../testing/bridge";
import { type DrawRunFixture, startDrawRun } from "../../../testing/draw-run";
import { meanderRecord } from "../../../testing/meanders";
import { CHARACTERISTIC_KEYS } from "../characteristics/characteristics.constants";

import { DrawCodeService } from "./draw-code.service";
import { DrawEnumerationService } from "./draw-enumeration.service";
import { DrawIndexService } from "./draw-index.service";

import type { CharacteristicRecord } from "@codebase/meanderaw-db";

/** A characteristic no evaluator claims, as one a removed evaluator leaves behind. */
const RETIRED: CharacteristicRecord = {
  category: "path",
  description: "Measured by an evaluator since deleted.",
  documentationUrl: null,
  formula: null,
  isPattern: false,
  key: "retiredCount",
  name: "Retired Count",
  valueType: "number",
};

/**
 * `DrawCommand`'s catalog sync, over a database an earlier run left a
 * characteristic in that no evaluator now claims. `--code` runs the same sync
 * as a full draw run, so it stands in for one without paying for the
 * enumeration.
 */
describe("drawCommand catalog", () => {
  let drawRun: DrawRunFixture;

  beforeEach(async () => {
    drawRun = await startDrawRun([
      DrawCodeService,
      {
        provide: DrawEnumerationService,
        useValue: createMock<DrawEnumerationService>(),
      },
      { provide: DrawIndexService, useValue: createMock<DrawIndexService>() },
      { provide: LoggerService, useValue: createMock<LoggerService>() },
    ]);
  });

  afterEach(async () => {
    await drawRun.close();
  });

  it("deletes a characteristic no evaluator claims, along with the values stored under it, and registers every evaluator's", async () => {
    await drawRun.service.syncCharacteristics([
      ...drawRun.evaluators.catalog(),
      RETIRED,
    ]);
    await drawRun.service.save(
      meanderRecord({
        characteristics: { retiredCount: 3 },
        code: "02x02y0000",
        columns: 2,
        lattice: "0000",
        rows: 2,
      }),
    );

    await drawRun.command.run([], { code: "3c9a", columns: 2, rows: 2 });

    const catalog: { key: string }[] = await drawRun.dataSource.query(
      "SELECT key FROM meanderaw.characteristics ORDER BY key",
    );

    expect(catalog.map(({ key }) => key)).toStrictEqual(
      [...CHARACTERISTIC_KEYS, "isReducible"].toSorted(),
    );
    await expect(
      storedCharacteristics(drawRun.dataSource, "02x02y0000"),
    ).resolves.toStrictEqual({});
    await expect(
      storedCharacteristics(drawRun.dataSource, "02x02y3c9a"),
    ).resolves.toStrictEqual(
      drawRun.evaluators.stored(
        drawRun.evaluators.compute("02x02y3c9a"),
        drawRun.evaluators.isReducible("02x02y3c9a"),
      ),
    );
  });
});
