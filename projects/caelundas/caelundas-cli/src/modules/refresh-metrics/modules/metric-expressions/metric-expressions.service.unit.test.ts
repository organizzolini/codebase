import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { getDataSourceToken } from "@nestjs/typeorm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Measure, Metric, MetricExpression } from "@codebase/caelundas-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MetricExpressionsCheckError } from "./metric-expressions.constants";
import { MetricExpressionsService } from "./metric-expressions.service";

import type { DataSource } from "typeorm";

/** One metric, `events`, whose expression is the measure of the same slug. */
const METRICS = [
  Object.assign(new Metric(), {
    expressionId: "root",
    name: "Events",
    slug: "events",
    unit: "count",
  }),
];
const EXPRESSIONS = [
  Object.assign(new MetricExpression(), {
    id: "root",
    kind: "measure",
    measure: Object.assign(new Measure(), { name: "Events", slug: "events" }),
    parentId: null,
    position: 0,
  }),
];

/** A data source whose repositories answer the two reads with the rows above. */
function dataSource(): DataSource {
  return createMock<DataSource>({
    getRepository: (target: unknown) => ({
      find: vi
        .fn()
        .mockResolvedValue(target === Metric ? METRICS : EXPRESSIONS),
    }),
  });
}

describe(MetricExpressionsService, () => {
  let directory: string;
  let file: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "metric-expressions-"));
    file = path.join(directory, "metric-expressions.md");
  });

  afterEach(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(MetricExpressionsService, {
      providers: [{ provide: getDataSourceToken(), useValue: dataSource() }],
    });

    expect(instance).toBeInstanceOf(MetricExpressionsService);
  });

  it("reads a tree for each metric", async () => {
    const trees = await new MetricExpressionsService(dataSource()).read();

    expect(trees).toStrictEqual([
      {
        expression: { kind: "measure", name: "Events", slug: "events" },
        name: "Events",
        slug: "events",
        unit: "count",
      },
    ]);
  });

  it("writes the block into the file, and a check of it then passes", async () => {
    const service = new MetricExpressionsService(dataSource());

    await service.sync({ check: false, outputMarkdown: file });

    expect(fs.readFileSync(file, "utf8")).toContain("measure (events)");
    await expect(
      service.sync({ check: true, outputMarkdown: file }),
    ).resolves.toBeUndefined();
  });

  it("fails a check of a file that differs, and leaves it alone", async () => {
    fs.writeFileSync(file, "# Stale\n");

    await expect(
      new MetricExpressionsService(dataSource()).sync({
        check: true,
        outputMarkdown: file,
      }),
    ).rejects.toThrow(MetricExpressionsCheckError);
    expect(fs.readFileSync(file, "utf8")).toBe("# Stale\n");
  });
});
