import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { beforeAll, onTestFinished } from "vitest";

import { TEMPORARY_DIRECTORY_PREFIX } from "./temporary-directory.constants";

/**
 * Creates an empty directory for the running test, removed once it finishes.
 * `parent` holds it instead of the system temporary directory.
 */
export function createTemporaryDirectory(
  label: string,
  parent?: string,
): string {
  const directory = makeDirectory(label, parent);

  onTestFinished(() => {
    removeDirectory(directory);
  });

  return directory;
}

/**
 * Makes a fresh directory under the real path of `parent`, created when
 * missing, or of the system's temporary directory.
 */
export function makeDirectory(label: string, parent?: string): string {
  if (parent !== undefined) {
    fs.mkdirSync(parent, { recursive: true });
  }

  return fs.mkdtempSync(
    path.join(
      fs.realpathSync(parent ?? os.tmpdir()),
      `${TEMPORARY_DIRECTORY_PREFIX}${label}-`,
    ),
  );
}

/**
 * Creates one empty directory before the suite's first test, removed after it.
 * Call in a `describe` body; the returned function reads its path.
 */
export function useTemporaryDirectory(label: string): () => string {
  let directory: string | undefined;

  beforeAll(() => {
    const created = makeDirectory(label);
    directory = created;

    return () => {
      removeDirectory(created);
    };
  });

  return () => {
    if (directory === undefined) {
      throw new Error(
        `The "${label}" temporary directory was read before its suite started`,
      );
    }

    return directory;
  };
}

/** Removes a directory and everything in it, if it is still there. */
function removeDirectory(directory: string): void {
  fs.rmSync(directory, { force: true, recursive: true });
}
