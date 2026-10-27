import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Where every fixture tree is rooted: this project's gitignored `tmp/`,
 * never the system temporary directory.
 *
 * A spawned run resolves `@swc-node/register` from its working directory
 * upward, and a tree outside the workspace reaches none — which passes on
 * macOS and fails on Linux CI.
 */
export const FIXTURE_ROOT = path.resolve(import.meta.dirname, "../tmp");

/**
 * Writes a fixture tree, keyed by path relative to its root, and returns the
 * root.
 *
 * Every tree is a repository of its own — an empty `.git` folder marks it —
 * so the `tmp` pattern in this workspace's own `.gitignore` never reaches it.
 * It holds exactly the files given, so a fixture's vocabulary is only what it
 * says; `run` names this project's `tsconfig.json` for the loader instead of
 * leaving one in the tree.
 *
 * Every caller owes the tree a `removeFixtureTree`.
 */
export function createFixtureTree(files: Record<string, string>): string {
  mkdirSync(FIXTURE_ROOT, { recursive: true });
  const root = mkdtempSync(path.join(FIXTURE_ROOT, "coinagerie-fixture-"));
  mkdirSync(path.join(root, ".git"));

  for (const [relativePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, contents);
  }

  return root;
}

/** Removes a fixture tree, whether or not the suite that made it passed. */
export function removeFixtureTree(root: string): void {
  rmSync(root, { force: true, recursive: true });
}
