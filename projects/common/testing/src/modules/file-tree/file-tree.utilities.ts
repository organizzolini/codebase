import fs from "node:fs";
import path from "node:path";

import { createTemporaryDirectory } from "../temporary-directory/temporary-directory.utilities";

import type { FileTreeOptions } from "./file-tree.types";

/** Creates a temporary directory holding `files`, keyed by relative path, and returns its root, removed once the test finishes. */
export function createFileTree(
  files: Readonly<Record<string, string>>,
  options: FileTreeOptions = {},
): string {
  const { git = false, label = "file-tree", symlinks = {} } = options;
  const root = createTemporaryDirectory(label);

  writeFileTree(root, files);

  if (git) {
    fs.mkdirSync(path.join(root, ".git"));
  }

  for (const [linkPath, targetPath] of Object.entries(symlinks)) {
    const absoluteLink = path.join(root, linkPath);

    fs.mkdirSync(path.dirname(absoluteLink), { recursive: true });
    fs.symlinkSync(path.join(root, targetPath), absoluteLink);
  }

  return root;
}

/**
 * Writes each file under `root`, keyed by relative path, creating the
 * directories on the way.
 */
export function writeFileTree(
  root: string,
  files: Readonly<Record<string, string>>,
): void {
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, contents);
  }
}
