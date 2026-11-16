import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { useTemporaryDirectory, writeFileTree } from "@codebase/testing";
import { runSourceCommand } from "@codebase/testing/end-to-end";

import { createFixtureTree } from "../testing/fixture-tree";

import { environmentSchema } from "./codometer-cli.constants";

import type { CodometerReport } from "@codometer/core";

const COMMAND_PATH = path.resolve(import.meta.dirname, "codometer-cli.main.ts");

/** The project's directory: swc resolves only from inside the workspace. */
const PROJECT_DIRECTORY = path.resolve(import.meta.dirname, "..");

/** Resolves the workspace's TypeScript path aliases for every spawned run. */
const TSCONFIG = path.join(PROJECT_DIRECTORY, "tsconfig.json");

/** Runs the command line from the project's directory with these arguments. */
async function runCommand(
  args: readonly string[],
): ReturnType<typeof runSourceCommand> {
  return runSourceCommand({
    args,
    directory: PROJECT_DIRECTORY,
    entry: COMMAND_PATH,
    timeout: 120_000,
    tsconfig: TSCONFIG,
  });
}

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  // Run as a real process rather than through the testing module, because the
  // thing under test is which file descriptor each byte came out of — and a
  // logger writing through a transport worker cannot be observed any other way.
  describe("the streams the command writes to", () => {
    const readTemporaryDirectory = useTemporaryDirectory("codometer-streams");
    let standardOutput: string;
    let standardError: string;

    beforeAll(async () => {
      const workingDirectory = createFixtureTree(readTemporaryDirectory());

      writeFileTree(workingDirectory, {
        "codometer.config.json": JSON.stringify({
          excludeFrom: [".codometerignore"],
          format: "json",
        }),
      });

      const result = await runCommand([
        "measure",
        "--config",
        path.join(workingDirectory, "codometer.config.json"),
        // The report goes to the console, and the badge block goes into a
        // file — so there is a written file to announce and nothing but the
        // report on standard output.
        "--format",
        "json",
        "--output-markdown",
        path.join(workingDirectory, "README.md"),
        workingDirectory,
      ]);

      standardError = result.stderr;
      standardOutput = result.stdout;
    }, 150_000);

    // `codometer --format json > report.json` has to produce a file something
    // can parse. A diagnostic sharing that stream is not a note beside the
    // data, it is a corruption of it.
    it("puts nothing but the report on standard output", () => {
      expect.hasAssertions();

      const report = JSON.parse(standardOutput) as CodometerReport;

      expect(report.targets[0]?.name).toBe("codebase");
      expect(report.targets[0]?.metrics.length).toBeGreaterThan(0);
    });

    it("still states plainly which files it left out, on standard error", () => {
      expect.hasAssertions();

      expect(standardError).toContain(
        "Excluded the files codometer writes from what it measures",
      );
      expect(standardError).toContain("README.md");
    });
  });

  // `--config` is required: codometer never searches for a configuration file.
  // Run as a real process because the refusal is the command line's own and
  // comes with its own exit code.
  describe("a run that names no configuration", () => {
    let standardError: string;
    let exitCode: number;

    beforeAll(async () => {
      const result = await runCommand(["measure"]);

      exitCode = result.exitCode;
      standardError = result.stderr;
    }, 150_000);

    it("is refused outright, naming the flag", () => {
      expect.hasAssertions();

      expect(exitCode).not.toBe(0);
      expect(standardError).toContain("--config");
    });
  });

  // The listing must survive an unreadable configuration, such as a `--config`
  // naming a missing file. Runs as a real process because the exit code is under
  // test, and nothing beneath the command line reports one.
  describe("the configuration command given a configuration that cannot be read", () => {
    const readTemporaryDirectory = useTemporaryDirectory("codometer-listing");
    let standardOutput: string;
    let standardError: string;
    let exitCode: number;

    beforeAll(async () => {
      const workingDirectory = readTemporaryDirectory();

      // One project configures itself. The root configuration the run names
      // below is not there.
      writeFileTree(workingDirectory, {
        "packages/logging/codometer.config.json": JSON.stringify({
          format: "json",
          limits: [{ label: "Bundle", metric: "codebase.size", value: 6000 }],
        }),
      });

      const result = await runCommand([
        "configuration",
        "--config",
        path.join(workingDirectory, "missing.config.json"),
        "--directory",
        workingDirectory,
        "--limits",
      ]);

      exitCode = result.exitCode;
      standardError = result.stderr;
      standardOutput = result.stdout;
    }, 150_000);

    it("still lists every limit the tree declares", () => {
      expect.hasAssertions();

      expect(standardOutput).toContain("Bundle");
      expect(standardOutput).toContain("`codebase.size`");
      expect(standardOutput).toContain(
        "`packages/logging/codometer.config.json`",
      );
    });

    it("says the walk root answered with nothing, rather than dying on it", () => {
      expect.hasAssertions();

      expect(standardOutput).toContain("Nothing answered for the walk root");
      expect(standardError).toContain(
        "Found no configuration answering for the walk root",
      );
    });

    it("fails the run rather than exiting clean", () => {
      expect.hasAssertions();
      expect(exitCode).toBe(1);
    });
  });

  describe("the changes command", () => {
    const readTemporaryDirectory = useTemporaryDirectory("codometer-changes");
    let outputPath: string;

    /** Builds a report for the one project, carrying one size value. */
    function buildReport(value: number): string {
      return JSON.stringify({
        targets: [
          {
            empty: false,
            metrics: [
              { limits: [], name: "logging.size", unit: "bytes", value },
            ],
            name: "logging",
          },
        ],
      });
    }

    beforeAll(async () => {
      const workingDirectory = readTemporaryDirectory();

      outputPath = path.join(workingDirectory, "section.md");

      writeFileTree(workingDirectory, {
        ".baseline/packages/logging/codometer-report.json": buildReport(1000),
        "packages/logging/codometer-report.json": buildReport(1200),
      });

      await runCommand([
        "changes",
        "--directory",
        workingDirectory,
        "--baseline",
        ".baseline",
        "--output",
        outputPath,
      ]);
    }, 150_000);

    it("writes a report naming the project whose metric changed", () => {
      expect.hasAssertions();

      const written = readFileSync(outputPath, "utf8");

      expect(written).toContain("## ⏲️ Codometer");
      expect(written).toContain("`logging`");
      expect(written).toContain("1.20 kB");
      expect(written).toContain("1.00 kB");
    });
  });
});
