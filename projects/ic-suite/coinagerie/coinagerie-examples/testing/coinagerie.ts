import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Drives the real coinagerie command line over the fixture projects.
 *
 * Every glossary, exit code, and refusal a guide in this package quotes is
 * produced by running the documented command through here, so a guide that
 * drifts from the tool fails a test rather than misleading a reader. The
 * command line is the seam on purpose: it is the interface the guides
 * describe, and testing anything beneath it would let the guides and the tool
 * disagree while the tests stayed green.
 */

// 🧭 Locations

/** The package itself. */
export const packageDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/** Where every example lives, one folder each. */
export const examplesDirectory = path.join(packageDirectory, "examples");

/** The command-line host, reached by path so `nx affected` ties this package to it. */
const cliDirectory = path.resolve(packageDirectory, "..", "coinagerie-cli");

/**
 * Where a staged copy of an example is made, inside this package.
 *
 * Not `os.tmpdir()`, and the reason is the loader rather than tidiness: a
 * spawned run resolves `@swc-node/register` from its working directory
 * upward, so a copy outside the workspace dies with `ERR_MODULE_NOT_FOUND` on
 * every Linux runner while passing on macOS. `tmp/` is already ignored by the
 * workspace `.gitignore`.
 */
const stagingDirectory = path.join(packageDirectory, "tmp");

/** Long enough for a cold swc start on a slow runner. */
export const SPAWN_TIMEOUT = 120_000;

// 🧪 Running

/** What a spawned run left behind. */
export interface RunResult {
  exitCode: null | number;
  standardError: string;
  standardOutput: string;
}

/** The words a printed markdown glossary lists, in the order printed. */
export function readWords(glossary: string): string[] {
  return [...glossary.matchAll(/^- \*\*(.+)\*\*:/gmu)].flatMap(([, word]) =>
    word === undefined ? [] : [word],
  );
}

/** Removes a staged copy, whether or not the suite that made it passed. */
export function removeStagedExample(root: string): void {
  fs.rmSync(root, { force: true, recursive: true });
}

/**
 * Runs the real command in a staged example, as a separate process, because
 * what is under test is its exit code, its streams, and the files it leaves.
 *
 * `SWC_NODE_PROJECT` names the command-line host's own `tsconfig.json`, which
 * carries the decorator settings Nest's injection needs, so the staged copy
 * stays exactly the files the guide shows rather than gaining one of its own.
 */
export function runCoinagerie(root: string, args: string[]): RunResult {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "@swc-node/register/esm-register",
      path.join(cliDirectory, "src", "coinagerie-cli.main.ts"),
      ...args,
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        SWC_NODE_PROJECT: path.join(cliDirectory, "tsconfig.json"),
      },
      timeout: SPAWN_TIMEOUT,
    },
  );

  return {
    exitCode: result.status,
    standardError: result.stderr,
    standardOutput: result.stdout,
  };
}

/**
 * Copies an example's `project/` folder into a fresh staging folder and
 * returns it, so a run can write without touching the committed fixture.
 *
 * Every staged copy is a repository of its own — an empty `.git` folder marks
 * it — so the workspace's own ignore rules never reach it. `extraFiles` is
 * for what an example's guide tells the reader to create, because a file the
 * example's own `.gitignore` hides cannot be committed beside it.
 */
export function stageExample(
  exampleName: string,
  extraFiles: Record<string, string> = {},
): string {
  fs.mkdirSync(stagingDirectory, { recursive: true });
  const root = fs.mkdtempSync(path.join(stagingDirectory, `${exampleName}-`));

  fs.cpSync(path.join(examplesDirectory, exampleName, "project"), root, {
    recursive: true,
  });
  fs.mkdirSync(path.join(root, ".git"));

  for (const [relativePath, contents] of Object.entries(extraFiles)) {
    const absolutePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, contents);
  }

  return root;
}
