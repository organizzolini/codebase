import { createMock } from "@golevelup/ts-vitest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import {
  bruteForceAggregates,
  derivedAbsent,
  storedAggregates,
} from "../../../testing/aggregates";
import {
  DRAW_RUN_TIMEOUT_MILLISECONDS,
  type DrawRunFixture,
  startDrawRun,
} from "../../../testing/draw-run";
import { DrawCodeService } from "../draw/modules/enumeration/draw-code.service";

/** Shapes written for these cases: enough meanders to make every table non-trivial, few enough to stay quick. */
const SHAPE_COUNT = 3;

/**
 * `AggregateCommand` over meanders written the way a draw run writes them,
 * without the aggregate step the full draw run ends with. Each case reads
 * the count tables back against a brute-force count of the meanders and the
 * bridge.
 */
describe("aggregateCommand", () => {
  let drawRun: DrawRunFixture;

  beforeAll(async () => {
    drawRun = await startDrawRun([
      { provide: DrawCodeService, useValue: createMock<DrawCodeService>() },
      { provide: LoggerService, useValue: createMock<LoggerService>() },
    ]);

    await drawRun.service.syncCharacteristics(drawRun.evaluators.catalog());
    await drawRun.service.saveAll(
      drawRun.enumeration
        .shapes()
        .slice(0, SHAPE_COUNT)
        .flatMap((shape) =>
          drawRun.enumeration
            .enumerate(shape)
            .map(({ code }) => drawRun.records.record(code, shape, false)),
        ),
    );
  }, DRAW_RUN_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await drawRun.close();
  });

  it("leaves the count tables empty until it runs, since drawing writes none", async () => {
    await expect(storedAggregates(drawRun.dataSource)).resolves.toStrictEqual({
      pairs: [],
      shapes: [],
      totals: [],
      values: [],
    });
  });

  it("fills every count table with exactly what a brute-force count of the meanders gives", async () => {
    await drawRun.aggregate.run();

    const { absent: _absent, ...counted } = await bruteForceAggregates(
      drawRun.dataSource,
    );

    expect(counted.totals).not.toHaveLength(0);
    expect(counted.pairs).not.toHaveLength(0);
    await expect(storedAggregates(drawRun.dataSource)).resolves.toStrictEqual(
      counted,
    );
  });

  it("lets a reader derive the 0 or false bucket, per characteristic and per shape, as the total minus the stored rows", async () => {
    await drawRun.aggregate.run();

    const { absent } = await bruteForceAggregates(drawRun.dataSource);

    await expect(derivedAbsent(drawRun.dataSource)).resolves.toStrictEqual(
      absent,
    );
  });

  it("sets each characteristic's meanderCount to the meanders holding it", async () => {
    await drawRun.aggregate.run();

    const mismatched: { key: string }[] = await drawRun.dataSource.query(
      `SELECT catalog.key FROM meanderaw.characteristics catalog
       WHERE catalog.meander_count <> (
         SELECT COUNT(*) FROM meanderaw.meander_characteristics bridge
         WHERE bridge.characteristic_id = catalog.id)`,
    );

    expect(mismatched).toStrictEqual([]);
  });

  it("produces the same tables when run again", async () => {
    await drawRun.aggregate.run();

    const first = await storedAggregates(drawRun.dataSource);

    await drawRun.aggregate.run();

    await expect(storedAggregates(drawRun.dataSource)).resolves.toStrictEqual(
      first,
    );
  });
});
