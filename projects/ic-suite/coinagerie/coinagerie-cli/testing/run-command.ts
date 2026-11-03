import { spawnSync } from "node:child_process";
import path from "node:path";

const COMMAND_PATH = path.resolve(
  import.meta.dirname,
  "../src/coinagerie-cli.main.ts",
);

/** Long enough for a cold swc start on a slow runner. */
export const SPAWN_TIMEOUT = 120_000;

/** What a spawned run left behind. */
export interface RunResult {
  exitCode: null | number;
  standardError: string;
  standardOutput: string;
}

/**
 * Runs the real command in a fixture tree, as a separate process, because
 * what is under test is its exit code, its streams, and the files it leaves.
 */
export function run(root: string, args: string[]): RunResult {
  const result = spawnSync(
    process.execPath,
    ["--import", "@swc-node/register/esm-register", COMMAND_PATH, ...args],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0" },
      timeout: SPAWN_TIMEOUT,
    },
  );

  return {
    exitCode: result.status,
    standardError: result.stderr,
    standardOutput: result.stdout,
  };
}
