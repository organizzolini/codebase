import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { beforeAll, onTestFinished } from "vitest";

import { TEMPORARY_DIRECTORY_PREFIX } from "./temporary-directory.constants";

/**
 * Creates an empty directory for the running test, named
 * `codebase-test-<label>-…`, and removes it with everything in it once the
 * test finishes. Call it from a test or a `beforeEach` hook.
 */
export function createTemporaryDirectory(label: string): string {
  const directory = makeDirectory(label);

  onTestFinished(() => {
    removeDirectory(directory);
  });

  return directory;
}

/**
 * Creates one empty directory before the enclosing suite's first test and
 * removes it once the suite finishes, for tests that share files. Call it in
 * a `describe` body; the returned function reads the directory's path.
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
