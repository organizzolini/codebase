import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTemporaryDirectory, writeFileTree } from "@codebase/testing";
import { runSourceCommand } from "@codebase/testing/end-to-end";

import type {
  CodometerReport,
  ReportMetric,
  ReportTarget,
} from "@codometer/core";

/**
 * Drives the real codometer command line over the sample corpus.
 *
 * Every number, badge, and refusal a guide in this package quotes is produced
 * by running the documented command through here, so a guide that drifts from
 * the tool fails a test rather than misleading a reader. The command line is
 * the seam on purpose: it is the interface the guides describe, and testing
 * anything beneath it would let the guides and the tool disagree while the
 * tests stayed green.
 */

// 🧭 Locations

/** The package itself, which is the directory its own configuration gates. */
export const packageDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/** This package's own configuration, passed with `--config`. */
export const packageConfiguration = path.join(
  packageDirectory,
  "codometer.config.ts",
);

const workspaceDirectory = path.resolve(
  packageDirectory,
  "..",
  "..",
  "..",
  "..",
);

/** Codometer command line, so `nx affected` sees tool changes. */
const commandLineEntry = path.resolve(
  createRequire(import.meta.url).resolve("@codometer/cli/package.json"),
  "..",
  "src",
  "codometer-cli.main.ts",
);

/** Corpus copy inside this package, where `@swc-node/register` resolves. */
const scratchDirectory = path.join(packageDirectory, "tmp");

/** Everything this package ships to be run: one directory per example. */
export const examplesDirectory = path.join(packageDirectory, "examples");

/** The committed sample corpus, which the read-only examples measure. */
export const corpusDirectory = path.join(examplesDirectory, "corpus");

/** Path of one shipped example configuration, from its segments. */
export const exampleConfiguration = (...segments: readonly string[]): string =>
  path.join(examplesDirectory, ...segments);

/** Pins `TS_NODE_PROJECT`, as examples have no tsconfig. */
const typescriptConfigurationPath = path.resolve(
  workspaceDirectory,
  "tsconfig.json",
);

// 🏷️ Report shapes

/**
 * The report shape, re-exported from the tool that produces it.
 *
 * Tests read it from here rather than from `@codometer/core` directly, so the
 * harness stays the one seam this package tests through — and so the day the
 * tool's report type changes, it changes here.
 */
export type { CodometerReport } from "@codometer/core";

/** What one run of the command line left behind. */
export interface CodometerRun {
  exitCode: number;
  standardError: string;
  standardOutput: string;
}

/** One breaching `comment` block; null for other metrics. */
export type ReportedDeclaration = NonNullable<
  ReportMetric["instances"]
>[number];

// 🏃 Running

/** Runs the command line; `cwd` is what gets measured. */
export const runCodometer = async (
  args: readonly string[],
  cwd: string = workspaceDirectory,
): Promise<CodometerRun> => {
  const result = await runSourceCommand({
    args,
    directory: cwd,
    entry: commandLineEntry,
    tsconfig: typescriptConfigurationPath,
  });

  return {
    exitCode: result.exitCode,
    standardError: result.stderr,
    standardOutput: result.stdout,
  };
};

/** Pipes stdout to a second process, so stray logs fail. */
export const runPipeline = (
  upstream: CodometerRun,
  readReport: string,
): CodometerRun => {
  const directory = createTemporaryDirectory("codometer-pipe");
  const downstream = path.join(directory, "downstream.mjs");

  // Says outright that the upstream stage produced nothing, rather than
  // failing as an unexplained `JSON.parse` on an empty string.
  writeFileTree(directory, {
    "downstream.mjs": [
      'let text = "";',
      'process.stdin.on("data", (chunk) => { text += chunk; });',
      'process.stdin.on("end", () => {',
      "  if (text.trim() === '') {",
      '    console.error("the upstream stage wrote nothing to standard output");',
      "    process.exit(1);",
      "  }",
      "  const report = JSON.parse(text);",
      // Written as text, not `console.log`: that colors a lone non-string when
      // `FORCE_COLOR` is inherited from the test runner, so the output would depend on how the test was invoked.
      // Converting to a string first removes that.
      String.raw`  process.stdout.write(String(${readReport}) + "\n");`,
      "});",
    ].join("\n"),
  });

  // Only what the run wrote to standard output crosses over. Its standard
  // error is held back deliberately: that separation is the property under
  // test, and merging the streams here would test nothing.
  const result = spawnSync(process.execPath, [downstream], {
    cwd: workspaceDirectory,
    encoding: "utf8",
    env: { ...process.env, NODE_OPTIONS: "" },
    input: upstream.standardOutput,
    maxBuffer: 32 * 1024 * 1024,
  });

  return {
    exitCode:
      upstream.exitCode === 0 ? (result.status ?? 1) : upstream.exitCode,
    standardError: upstream.standardError + result.stderr,
    standardOutput: result.stdout,
  };
};

/** Runs the command line and parses its report from stdout. */
export const measure = async (
  args: readonly string[],
  cwd: string = workspaceDirectory,
): Promise<CodometerReport> => {
  const run = await runCodometer([...args, "--format", "json"], cwd);

  return JSON.parse(run.standardOutput) as CodometerReport;
};

// 🧪 Example shorthands

/** Runs one example configuration over the committed corpus. */
export const measureExample = async (
  ...segments: readonly string[]
): Promise<CodometerReport> =>
  measure(["--config", exampleConfiguration(...segments)], corpusDirectory);

/** Runs one example configuration as a gate, and returns what it produced. */
export const gateExample = async (
  ...segments: readonly string[]
): Promise<CodometerRun> =>
  runCodometer(
    ["--config", exampleConfiguration(...segments), "--check", "limits"],
    corpusDirectory,
  );

/** What one gating run produced, and the report it printed while gating. */
export interface GatedMeasurement {
  report: CodometerReport;
  run: CodometerRun;
}

/** Runs one example as a gate in a single spawn. */
export const gateAndMeasureExample = async (
  ...segments: readonly string[]
): Promise<GatedMeasurement> => {
  const run = await runCodometer(
    [
      "--config",
      exampleConfiguration(...segments),
      "--check",
      "limits",
      "--format",
      "json",
    ],
    corpusDirectory,
  );

  return { report: JSON.parse(run.standardOutput) as CodometerReport, run };
};

/** Reads one measured target from a report by name. */
export const readTarget = (
  report: CodometerReport,
  name: string,
): ReportTarget => {
  const target = report.targets.find((candidate) => candidate.name === name);

  if (target === undefined) {
    throw new Error(`No target called "${name}" in the report.`);
  }

  return target;
};

/** Reads one metric's value from a target by path. */
export const readMetric = (
  report: CodometerReport,
  targetName: string,
  metricPath: string,
): number => {
  const metric = readTarget(report, targetName).metrics.find(
    (candidate) => candidate.path === metricPath,
  );

  if (metric === undefined) {
    throw new Error(`No metric "${metricPath}" on target "${targetName}".`);
  }

  return metric.value;
};

/** Reads every limit on one metric, in written order. */
export const readMetricLimits = (
  report: CodometerReport,
  targetName: string,
  metricPath: string,
): ReportMetric["limits"] => {
  const metric = readTarget(report, targetName).metrics.find(
    (candidate) => candidate.path === metricPath,
  );

  if (metric === undefined) {
    throw new Error(`No metric "${metricPath}" on target "${targetName}".`);
  }

  return metric.limits;
};

/** Reads one metric's breaching instances; `null` if it only counts. */
export const readMetricInstances = (
  report: CodometerReport,
  targetName: string,
  metricPath: string,
): ReportMetric["instances"] => {
  const metric = readTarget(report, targetName).metrics.find(
    (candidate) => candidate.path === metricPath,
  );

  if (metric === undefined) {
    throw new Error(`No metric "${metricPath}" on target "${targetName}".`);
  }

  return metric.instances;
};

/** Reads every custom counter from the codebase target, keyed by label. */
export const readCounters = (
  report: CodometerReport,
): Record<string, number> => {
  const counters: Record<string, number> = {};

  for (const metric of readTarget(report, "codebase").metrics) {
    if (metric.path.startsWith("custom.")) {
      counters[metric.path.slice("custom.".length)] = metric.value;
    }
  }

  return counters;
};

// 📋 Scratch copies

/** Runs a body on a copied corpus, keeping the original. */
export const withCorpusCopy = async <Result>(
  body: (directory: string) => Promise<Result> | Result,
): Promise<Result> => {
  fs.mkdirSync(scratchDirectory, { recursive: true });

  const directory = fs.mkdtempSync(path.join(scratchDirectory, "corpus-"));

  try {
    fs.cpSync(corpusDirectory, directory, { recursive: true });

    return await body(directory);
  } finally {
    fs.rmSync(directory, { force: true, recursive: true });
  }
};
