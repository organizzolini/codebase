import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

/** The project root, which `start` runs the command line from. */
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");

/** Starting Node with the TypeScript loader takes a few seconds. */
const SPAWN_TIMEOUT_MILLISECONDS = 60_000;

/**
 * Runs `src/database.main.ts` with `argv` as `start` does, in a process of
 * its own and with no Postgres variable in its environment.
 */
function runMain(argv: readonly string[]): {
  readonly output: string;
  readonly status: null | number;
} {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.includes("POSTGRES") && !key.startsWith("PG"),
    ),
  );
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "@swc-node/register/esm-register",
      "src/database.main.ts",
      ...argv,
    ],
    { cwd: PROJECT_ROOT, encoding: "utf8", env: environment },
  );
  return { output: `${result.stdout}${result.stderr}`, status: result.status };
}

// Run as a real process rather than through the testing module, because the
// thing under test is what reaches the terminal: a log line the logger only
// buffered would pass every in-process test and still print nothing.
describe("main end-to-end suite", () => {
  it(
    "lists its commands",
    () => {
      const { output, status } = runMain(["--help"]);

      expect(status).toBe(0);
      expect(output).toMatch(/^\s+export\b/mu);
      expect(output).toMatch(/^\s+import\b/mu);
    },
    SPAWN_TIMEOUT_MILLISECONDS,
  );

  it(
    "prints why a command failed and exits non-zero, needing no Postgres environment",
    () => {
      const { output, status } = runMain([
        "export",
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
        "--table widgets names no schema: qualify it as schema.table, or pass --namespace <schema>",
      );
      expect(output).not.toContain("hunter2-secret");
    },
    SPAWN_TIMEOUT_MILLISECONDS,
  );
});
