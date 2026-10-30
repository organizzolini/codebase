import { writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ConfigurationModule,
  ConfigurationService,
} from "@codometer/configuration";
import { beforeAll, describe, expect, it } from "vitest";

import { useTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { buildCodeStatistics } from "../../../testing/mocks";

import { LimitsService } from "./limits.service";
import { MetricIndexService } from "./metric-index.service";

import type { EvaluatedLimit, MeasuredTarget } from "./limits.types";

/** Two targets holding the metrics the configuration below limits. */
const TARGETS: MeasuredTarget[] = [
  {
    files: 12,
    language: buildCodeStatistics({
      typescript: { ...buildCodeStatistics().typescript, interfaces: 42 },
    }),
    name: "codebase",
    size: undefined,
  },
  {
    files: 2,
    language: undefined,
    name: "compiled",
    size: { bytes: 4529, compression: "gzip", files: 2 },
  },
];

describe("limits written in a configuration file", () => {
  let evaluated: EvaluatedLimit[];
  const directory = useTemporaryDirectory("codometer-limits-");

  beforeAll(async () => {
    const configurationPath = path.join(directory(), "codometer.config.json");

    await writeFile(
      configurationPath,
      JSON.stringify({
        defaultInput: "codebase",
        format: "json",
        inputs: [
          { analyses: ["size"], include: ["dist/**/*.js"], name: "compiled" },
        ],
        limits: [
          // Unqualified, so the default target has to supply the name.
          { metric: "typescript.interfaces", value: "40" },
          { label: "Bundle", metric: "compiled.size", value: "4 KB" },
        ],
      }),
      "utf8",
    );

    const { module } = await buildTestingModule(LimitsService, {
      imports: [ConfigurationModule],
      providers: [MetricIndexService],
    });
    const configuration = await module
      .get(ConfigurationService)
      .loadConfiguration({ configurationPath });

    const { indexes } = module.get(MetricIndexService).index(TARGETS);

    evaluated = module
      .get(LimitsService)
      .evaluate({ configuration, indexes }).limits;
  });

  it("holds an unqualified path against the default target", () => {
    expect(evaluated[0]).toStrictEqual({
      breached: true,
      label: undefined,
      limit: 40,
      measured: 42,
      metric: "typescript.interfaces",
      severity: "fail",
      target: "codebase",
    });
  });

  // Written "4 KB" in the file and compared as 4000 bytes here, with the
  // severity nobody wrote defaulting to the one that stops a run.
  it("reads a declared size limit in decimal units", () => {
    expect(evaluated[1]).toStrictEqual({
      breached: true,
      label: "Bundle",
      limit: 4000,
      measured: 4529,
      metric: "size",
      severity: "fail",
      target: "compiled",
    });
  });
});
