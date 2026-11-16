import path from "node:path";

import { describe, expect, it } from "vitest";

import { createFileTree } from "@codebase/testing";
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

/** Every fixture sits one level under `FIXTURE_ROOT`, so this reaches the package's tsconfig. */
const FIXTURE_TSCONFIG = JSON.stringify({ extends: "../../tsconfig.json" });

/** Writes a fixture directory inside the package, with the tsconfig the command line's decorators need. */
function createFixture(label: string, files: Record<string, string>): string {
  return createFileTree(
    { ...files, "tsconfig.json": FIXTURE_TSCONFIG },
    { label, parent: FIXTURE_ROOT },
  );
}

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  describe("the streams the command writes to", () => {
    /** Runs `map --write` over a fresh fixture, as a command line would. */
    async function runMap(): Promise<{
      standardError: string;
      standardOutput: string;
    }> {
      const workingDirectory = createFixture("codependix-cli-stream-test", {
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

      return { standardError: result.stderr, standardOutput: result.stdout };
    }

    it("puts nothing but valid combined JSON on standard output", async () => {
      expect.hasAssertions();

      const { standardOutput } = await runMap();

      expect(() => {
        JSON.parse(standardOutput);
      }).not.toThrow();
    }, 150_000);

    it("puts diagnostic log messages on standard error", async () => {
      expect.hasAssertions();

      const { standardError } = await runMap();

      expect(standardError).toContain("ReportingService");
    }, 150_000);
  });

  describe("a boundaries-only run printing its report", () => {
    /** Runs `--check boundaries` over a fresh fixture with the given extra flags. */
    async function runBoundaries(flags: string[]): Promise<{
      exitCode: number;
      standardError: string;
      standardOutput: string;
    }> {
      // a ⇄ b is a cycle, and c depends on a.
      const workingDirectory = createFixture("codependix-cli-boundaries-test", {
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
      });
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
    }, 150_000);

    it("logs on standard error and prints nothing without a format flag", async () => {
      expect.hasAssertions();

      const { exitCode, standardError, standardOutput } = await runBoundaries(
        [],
      );

      expect(exitCode).toBe(1);
      expect(standardOutput).toBe("");
      expect(standardError).toContain("boundary violations");
    }, 150_000);
  });

  describe("a command line naming no configuration", () => {
    /** Runs a command with no `--config`, in a directory holding a default-named file. */
    async function runWithoutConfig(command: string[]): Promise<{
      exitCode: number;
      standardError: string;
      standardOutput: string;
    }> {
      // A default-named file must not be found: nothing is searched for.
      const workingDirectory = createFixture("codependix-cli-no-config-test", {
        "codependix.config.json": "{}",
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
