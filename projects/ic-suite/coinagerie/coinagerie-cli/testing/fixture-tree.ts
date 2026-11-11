import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Gitignored `tmp/`, never system temp: spawns resolve `@swc-node/register` only in-workspace. */
export const FIXTURE_ROOT = path.resolve(import.meta.dirname, "../tmp");

/**
 * Writes a fixture tree and returns its root. It is its own repository, so the
 * workspace `.gitignore` never reaches it. Free with `removeFixtureTree`.
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
