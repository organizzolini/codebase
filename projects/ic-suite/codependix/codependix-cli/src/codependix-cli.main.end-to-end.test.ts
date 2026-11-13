import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { writeFileTree } from "@codebase/testing";
import { runSourceCommand } from "@codebase/testing/end-to-end";

import { environmentSchema } from "./codependix-cli.constants";

const COMMAND_PATH = path.resolve(
  import.meta.dirname,
  "codependix-cli.main.ts",
);

/**
 * Fixtures live in the package, not the OS temp directory: the swc loader resolves from the
 * working directory, which must sit inside the workspace.
 */
const FIXTURE_ROOT = path.resolve(import.meta.dirname, "../tmp");

/** The tsconfig every fixture extends, so the command line's decorators compile. */
function writeTsconfig(directory: string): string {
  return JSON.stringify({
    extends: path.relative(
      directory,
      path.resolve(import.meta.dirname, "../tsconfig.json"),
    ),
  });
}

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  describe("the streams the command writes to", () => {
    let standardOutput: string;
    let standardError: string;
    let workingDirectory: string;

    beforeAll(async () => {
      mkdirSync(FIXTURE_ROOT, { recursive: true });
      workingDirectory = mkdtempSync(
        path.join(FIXTURE_ROOT, "codependix-cli-stream-test-"),
      );

      writeFileTree(workingDirectory, {
        "codependix.config.json": JSON.stringify({
          include: [],
          workspace: {
            nxProjects: {
              json: {
                path: "codependix-nx-projects.json",
              },
              target: "json",
            },
          },
        }),
        "tsconfig.json": writeTsconfig(workingDirectory),
      });

      const result = await runSourceCommand({
        args: [
          "map",
          "--config",
          path.join(workingDirectory, "codependix.config.json"),
          "--format",
          "json",
          "--write",
        ],
        directory: workingDirectory,
        entry: COMMAND_PATH,
      });

      standardError = result.stderr;
      standardOutput = result.stdout;
    }, 150_000);

    afterAll(() => {
      rmSync(workingDirectory, { force: true, recursive: true });
    });

    it("puts nothing but valid combined JSON on standard output", () => {
      expect.hasAssertions();

      expect(() => {
        JSON.parse(standardOutput);
      }).not.toThrow();
    });

    it("puts diagnostic log messages on standard error", () => {
      expect.hasAssertions();

      expect(standardError).toContain("ReportingService");
    });
  });

  describe("a boundaries-only run printing its report", () => {
    let workingDirectory: string;

    /** Runs `--check boundaries` over the fixture with the given extra flags. */
    async function runBoundaries(flags: string[]): Promise<{
      exitCode: number;
      standardError: string;
      standardOutput: string;
    }> {
      const result = await runSourceCommand({
        args: [
          "map",
          "--config",
          path.join(workingDirectory, "codependix.config.json"),
          "--check",
          "boundaries",
          "--projects",
          "a",
          ...flags,
        ],
        directory: workingDirectory,
        entry: COMMAND_PATH,
      });

      return {
        exitCode: result.exitCode,
        standardError: result.stderr,
        standardOutput: result.stdout,
      };
    }

    beforeAll(() => {
      mkdirSync(FIXTURE_ROOT, { recursive: true });
      workingDirectory = mkdtempSync(
        path.join(FIXTURE_ROOT, "codependix-cli-boundaries-test-"),
      );

      // a ⇄ b is a cycle, and c depends on a.
      writeFileTree(workingDirectory, {
        "codependix-graph.json": JSON.stringify({
          dependencies: {
            a: [{ source: "a", target: "b", type: "static" }],
            b: [{ source: "b", target: "a", type: "static" }],
            c: [{ source: "c", target: "a", type: "static" }],
          },
          nodes: Object.fromEntries(
            ["a", "b", "c"].map((name) => [
              name,
              { data: { root: `packages/${name}` }, name, type: "lib" },
            ]),
          ),
        }),
        "codependix.config.json": JSON.stringify({
          boundaries: {
            nxProjects: [{ kind: "acyclic", name: "no-cycles" }],
          },
          include: [],
          projectGraph: "codependix-graph.json",
        }),
        "tsconfig.json": writeTsconfig(workingDirectory),
      });
    });

    afterAll(() => {
      rmSync(workingDirectory, { force: true, recursive: true });
    });

    it("puts nothing but a parseable report with a boundaries key on standard output", async () => {
      expect.hasAssertions();

      const { exitCode, standardOutput } = await runBoundaries([
        "--format",
        "json",
      ]);
      const report = JSON.parse(standardOutput) as {
        boundaries: {
          judgedProjects: string[];
          violations: { projects: string[]; verdict: string }[];
        };
      };

      expect(exitCode).toBe(1);
      expect(report.boundaries.judgedProjects).toStrictEqual(["a"]);
      expect(report.boundaries.violations).toHaveLength(1);
      expect(report.boundaries.violations[0]).toMatchObject({
        projects: ["a", "b"],
        verdict: "fail",
      });
    });

    it("logs on standard error and prints nothing without a format flag", async () => {
      expect.hasAssertions();

      const { exitCode, standardError, standardOutput } = await runBoundaries(
        [],
      );

      expect(exitCode).toBe(1);
      expect(standardOutput).toBe("");
      expect(standardError).toContain("boundary violations");
    });
  });

  describe("a command line naming no configuration", () => {
    /** Runs a command with no `--config`, in a directory holding a default-named file. */
    async function runWithoutConfig(command: string[]): Promise<{
      exitCode: number;
      standardError: string;
      standardOutput: string;
    }> {
      mkdirSync(FIXTURE_ROOT, { recursive: true });

      const workingDirectory = mkdtempSync(
        path.join(FIXTURE_ROOT, "codependix-cli-no-config-test-"),
      );

      try {
        // A default-named file must not be found: nothing is searched for.
        writeFileTree(workingDirectory, {
          "codependix.config.json": "{}",
          "tsconfig.json": writeTsconfig(workingDirectory),
        });

        const result = await runSourceCommand({
          args: command,
          directory: workingDirectory,
          entry: COMMAND_PATH,
        });

        return {
          exitCode: result.exitCode,
          standardError: result.stderr,
          standardOutput: result.stdout,
        };
      } finally {
        rmSync(workingDirectory, { force: true, recursive: true });
      }
    }

    it.each([
      ["map", ["map", "--check", "boundaries"]],
      ["path", ["path", "a", "b"]],
    ])(
      "refuses %s, naming the --config flag",
      async (_name, command) => {
        expect.hasAssertions();

        const { exitCode, standardError, standardOutput } =
          await runWithoutConfig(command);

        expect(exitCode).not.toBe(0);
        expect(standardOutput).toBe("");
        expect(standardError).toContain("--config");
      },
      150_000,
    );
  });
});
