import fs from "node:fs";
import path from "node:path";

import {
  EPHEMERIS_DIRECTORY,
  EPHEMERIS_FILENAMES,
  EphemerisFilesMissingError,
} from "./ephemeris-download.constants";

import type { EphemerisFilename } from "./ephemeris-download.types";

// 🌎 Utilities

/**
 * Throws when any data file is missing from `directory`.
 *
 * @throws EphemerisFilesMissingError - Naming each missing file and the
 * command that downloads them.
 */
export function assertEphemerisFilesPresent(
  directory: string = resolveEphemerisDirectory(),
): void {
  const missing = findMissingEphemerisFiles(directory);

  if (missing.length > 0) {
    throw new EphemerisFilesMissingError(directory, missing);
  }
}

/** The data files absent from `directory`, or present but empty. */
export function findMissingEphemerisFiles(
  directory: string,
): EphemerisFilename[] {
  return EPHEMERIS_FILENAMES.filter(
    (filename) => !isEphemerisFilePresent(path.join(directory, filename)),
  );
}

/** Whether `file` exists and holds something: an empty file is a failed download. */
export function isEphemerisFilePresent(file: string): boolean {
  try {
    return fs.statSync(file).size > 0;
  } catch {
    return false;
  }
}

/** The absolute directory the data files live in, from the working directory. */
export function resolveEphemerisDirectory(): string {
  return path.resolve(EPHEMERIS_DIRECTORY);
}
