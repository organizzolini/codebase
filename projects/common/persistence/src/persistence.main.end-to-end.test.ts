import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { runSourceCommand } from "@codebase/testing/end-to-end";

/** The project root, which `start` runs the command line from. */
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");

/** Starting Node with the TypeScript loader takes a few seconds. */
const SPAWN_TIMEOUT_MILLISECONDS = 60_000;

/**
 * Runs `persistence.main.ts` in its own process, with no Postgres variable and
 * the default log level: the sanitized environment carries neither.
 */
async function runMain(argv: readonly string[]): Promise<{
  readonly output: string;
  readonly status: number;
}> {
  const result = await runSourceCommand({
    args: argv,
    directory: PROJECT_ROOT,
    entry: "src/persistence.main.ts",
    timeout: SPAWN_TIMEOUT_MILLISECONDS,
  });

  return {
    output: `${result.stdout}${result.stderr}`,
    status: result.exitCode,
  };
}

// Run as a real process rather than through the testing module, because the
// thing under test is what reaches the terminal: a log line the logger only
// buffered would pass every in-process test and still print nothing.
describe("main end-to-end suite", () => {
  it(
    "lists its commands",
    async () => {
      const { output, status } = await runMain(["--help"]);

      expect(status).toBe(0);
      expect(output).toMatch(/^\s+postgresql-export\b/mu);
      expect(output).toMatch(/^\s+postgresql-import\b/mu);
    },
    SPAWN_TIMEOUT_MILLISECONDS,
  );

  it(
    "prints why a command failed and exits non-zero, needing no Postgres environment",
    async () => {
      const { output, status } = await runMain([
        "postgresql-export",
        "--source-uri",
        "postgresql://fixture_username:hunter2-secret@127.0.0.1:1/fixture_development",
        "--table",
        "widgets",
        "--data",
        "--file",
        "never.dump",
      ]);

      expect(status).toBe(1);
      expect(output).toContain(
        "--table widgets names no schema: qualify it as schema.table, or pass --schema <name>",
      );
      expect(output).not.toContain("hunter2-secret");
    },
    SPAWN_TIMEOUT_MILLISECONDS,
  );

  it(
    "prints a dry run's plan and exits zero, writing no file",
    async () => {
      const directory = createTemporaryDirectory("database-main-dry-run");
      const file = path.join(directory, "never.dump");

      const { output, status } = await runMain([
        "postgresql-export",
        "--source-uri",
        "postgresql://fixture_username:hunter2-secret@127.0.0.1:1/fixture_development",
        "--table",
        "fixture.widgets",
        "--data",
        "--file",
        file,
        "--dry-run",
      ]);

      expect(status).toBe(0);
      expect(output).toContain("Planning to export data of fixture.widgets");
      expect(output).toContain(`Planning to create ${file}`);
      expect(output).not.toContain("hunter2-secret");
      expect(fs.readdirSync(directory)).toStrictEqual([]);
    },
    SPAWN_TIMEOUT_MILLISECONDS,
  );
});
