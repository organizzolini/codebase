import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { JsonService } from "./json.service";

import type { LoggerService } from "@codebase/observability";
import type { DeepMocked } from "@golevelup/ts-vitest";

const sampleReport = {
  failures: [],
  targets: [
    {
      empty: false,
      files: 3,
      metrics: [
        {
          limits: [],
          name: "codebase.files",
          path: "files",
          unit: null,
          value: 3,
        },
      ],
      name: "codebase",
    },
  ],
};

describe(JsonService, () => {
  let service: JsonService;
  let loggerService: DeepMocked<LoggerService>;

  beforeAll(async () => {
    const { instance, logger } = await buildTestingModule(JsonService);

    service = instance;
    loggerService = logger;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(JsonService);

    expect(instance).toBeInstanceOf(JsonService);
  });

  it("renders the report with the configured indentation", () => {
    const rendered = service.render({ indentation: 4, report: sampleReport });

    expect(rendered).toBe(`${JSON.stringify(sampleReport, null, 4)}\n`);
    expect(rendered.endsWith("\n")).toBe(true);
  });

  it("writes the report, creating missing parent directories", () => {
    const reportPath = path.join(
      createTemporaryDirectory("codometer-json-"),
      "output/reports/codometer.json",
    );

    expect(
      service.sync({
        check: false,
        indentation: 2,
        path: reportPath,
        report: sampleReport,
      }),
    ).toBe(true);
    expect(existsSync(reportPath)).toBe(true);
    expect(JSON.parse(readFileSync(reportPath, "utf8"))).toStrictEqual(
      sampleReport,
    );
    expect(loggerService.info).toHaveBeenCalledWith(
      "📝 Wrote the JSON report",
      undefined,
      { path: reportPath },
    );
  });

  it("returns true when checking a report that is current", () => {
    const reportPath = path.join(
      createTemporaryDirectory("codometer-json-"),
      "codometer.json",
    );

    service.sync({
      check: false,
      indentation: 2,
      path: reportPath,
      report: sampleReport,
    });

    expect(
      service.sync({
        check: true,
        indentation: 2,
        path: reportPath,
        report: sampleReport,
      }),
    ).toBe(true);
  });

  it("returns false when checking a report that is stale", () => {
    const reportPath = path.join(
      createTemporaryDirectory("codometer-json-"),
      "codometer.json",
    );

    writeFileSync(reportPath, "{}\n", "utf8");

    expect(
      service.sync({
        check: true,
        indentation: 2,
        path: reportPath,
        report: sampleReport,
      }),
    ).toBe(false);
  });

  it("returns false when checking a report that is missing", () => {
    const reportPath = path.join(
      createTemporaryDirectory("codometer-json-"),
      "codometer.json",
    );

    expect(
      service.sync({
        check: true,
        indentation: 2,
        path: reportPath,
        report: sampleReport,
      }),
    ).toBe(false);
  });
});
