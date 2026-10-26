import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Where fake workspaces are built: this project's gitignored `tmp/`.
 *
 * Never the system temporary directory, which sits outside the workspace and
 * so outside the reach of the swc register hook on a Linux runner.
 */
const TEMPORARY_ROOT = path.join(import.meta.dirname, "..", "tmp");

/** A workspace built on disk, and the way to remove it. */
export interface FakeWorkspace {
  /** Deletes the workspace. */
  readonly remove: () => void;
  /** Absolute path of the workspace root. */
  readonly root: string;
}

/**
 * Builds a workspace on disk from a map of relative path to file content.
 *
 * Only what a test names exists, so a folder with a `project.json` is a
 * project and one without is not, which is exactly the difference inference
 * has to see.
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
