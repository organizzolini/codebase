import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startCaelundasDatabase,
} from "../../../../../testing/support/database";

import { MetricExpressionsModule } from "./metric-expressions.module";
import { MetricExpressionsService } from "./metric-expressions.service";
import { infixOf } from "./metric-expressions.utilities";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";

/** The metrics the migration seeds. */
const SEEDED_METRIC_COUNT = 18;

describe(MetricExpressionsService, () => {
  let database: DatabaseTestingModule;
  let service: MetricExpressionsService;

  beforeAll(async () => {
    database = await startCaelundasDatabase([
      LoggerModule,
      MetricExpressionsModule,
    ]);
    service = database.module.get(MetricExpressionsService);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await database.close();
  });

  it("reads the expression tree of every seeded metric, by slug", async () => {
    const trees = await service.read();

    expect(trees).toHaveLength(SEEDED_METRIC_COUNT);
    expect(trees.map(({ slug }) => slug)).toStrictEqual(
      trees.map(({ slug }) => slug).toSorted((a, b) => a.localeCompare(b)),
    );
  });

  it("writes the operands of a percent metric in position order, as an infix expression", async () => {
    const trees = await service.read();
    const percent = trees.find(({ slug }) => slug === "total-time-percent");

    expect(percent === undefined ? "" : infixOf(percent.expression)).toBe(
      "clipped-duration % of period-length",
    );
  });
});
