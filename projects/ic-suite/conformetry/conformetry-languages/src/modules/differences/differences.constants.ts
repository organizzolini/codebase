// ♟️ Constants

import type {
  ConformetryDifferenceLanguage,
  ConformetryDifferenceType,
} from "@conformetry/core";

/** Recognized error languages, for narrowing untrusted payloads. */
export const CONFORMETRY_ERROR_LANGUAGES: readonly ConformetryDifferenceLanguage[] =
  ["javascript", "json", "markdown", "python", "text", "typescript"];

/** Recognized error categories; unknown ones coerce to `"code"`. */
export const CONFORMETRY_ERROR_TYPES: readonly ConformetryDifferenceType[] = [
  "code",
  "comment",
  "directory",
  "file",
  "instance",
  "placeholder",
];

/** Category used when an untrusted payload carries an unrecognized one. */
export const DEFAULT_CONFORMETRY_ERROR_TYPE: ConformetryDifferenceType = "code";
