import path from "node:path";

import { runSourceCommand } from "@codebase/testing/end-to-end";

import type { FileTreeOptions } from "@codebase/testing";

const COMMAND_PATH = path.resolve(
  import.meta.dirname,
  "../src/coinagerie-cli.main.ts",
);

const PROJECT_TSCONFIG_PATH = path.resolve(
  import.meta.dirname,
  "../tsconfig.json",
);

/** Gitignored `tmp/`, never system temp: spawns resolve `@swc-node/register` only in-workspace. */
const FIXTURE_ROOT = path.resolve(import.meta.dirname, "../tmp");

/** Options for a fixture tree a spawned run reads: a repository, held in-workspace. */
export const FIXTURE_OPTIONS = {
  git: true,
  label: "coinagerie",
  parent: FIXTURE_ROOT,
} satisfies FileTreeOptions;

/** Long enough for a cold swc start on a slow runner. */
export const SPAWN_TIMEOUT = 120_000;

/** What a spawned run left behind. */
export interface RunResult {
  exitCode: null | number;
  standardError: string;
  standardOutput: string;
}

/**
 * Runs the real command in a separate process, since the test checks its exit
 * code, streams, and written files.
 */
export async function run(root: string, args: string[]): Promise<RunResult> {
  const result = await runSourceCommand({
    args,
    directory: root,
    entry: COMMAND_PATH,
    timeout: SPAWN_TIMEOUT,
    tsconfig: PROJECT_TSCONFIG_PATH,
  });

  return {
    exitCode: result.exitCode,
    standardError: result.stderr,
    standardOutput: result.stdout,
  };
}
