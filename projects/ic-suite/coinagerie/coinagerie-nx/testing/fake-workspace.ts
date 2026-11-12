import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Fake workspaces in gitignored `tmp/`; system temp fails on Linux. */
const TEMPORARY_ROOT = path.join(import.meta.dirname, "..", "tmp");

/** A workspace built on disk, and the way to remove it. */
export interface FakeWorkspace {
  /** Deletes the workspace. */
  readonly remove: () => void;
  /** Absolute path of the workspace root. */
  readonly root: string;
}

/**
 * Writes a workspace from relative paths to contents. Only named files exist, so
 * a folder is a project only if it has a `project.json`.
 */
export function createFakeWorkspace(
  files: Readonly<Record<string, string>>,
): FakeWorkspace {
  mkdirSync(TEMPORARY_ROOT, { recursive: true });

  const root = mkdtempSync(path.join(TEMPORARY_ROOT, "workspace-"));

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);

    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content);
  }

  return {
    remove: (): void => {
      rmSync(root, { force: true, recursive: true });
    },
    root,
  };
}
