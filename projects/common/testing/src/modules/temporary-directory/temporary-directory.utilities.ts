import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { beforeAll, onTestFinished } from "vitest";

import { TEMPORARY_DIRECTORY_PREFIX } from "./temporary-directory.constants";

/**
 * Creates an empty directory for the running test, removed with its contents
 * once the test finishes.
 */
export function createTemporaryDirectory(label: string): string {
  const directory = makeDirectory(label);

  onTestFinished(() => {
    removeDirectory(directory);
  });

  return directory;
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

/** Makes a fresh directory under the real path of the system's temporary directory. */
function makeDirectory(label: string): string {
  return fs.mkdtempSync(
    path.join(
      fs.realpathSync(os.tmpdir()),
      `${TEMPORARY_DIRECTORY_PREFIX}${label}-`,
    ),
  );
}

/** Removes a directory and everything in it, if it is still there. */
function removeDirectory(directory: string): void {
  fs.rmSync(directory, { force: true, recursive: true });
}
