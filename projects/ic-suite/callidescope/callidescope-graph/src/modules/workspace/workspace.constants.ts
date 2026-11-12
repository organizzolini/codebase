// ♟️ Constants

/** Directories a project scan skips: dependency caches and generated output. */
export const EXCLUDED_SCAN_DIRECTORY_NAMES = [
  "node_modules",
  ".git",
  ".nx",
  ".conformetry",
  "dist",
  "build",
  "coverage",
  "out",
] as const;

/** Project root marker; a lone `tsconfig.json` is shared settings. */
export const PACKAGE_MANIFEST_NAME = "package.json";

/** Project-marking file, named once for discovery and exclusions. */
export const PROJECT_CONFIGURATION_NAME = "tsconfig.json";

/** Test scaffolding directory; reports must not count its files. */
export const TEST_DIRECTORY_SEGMENT = "testing";

/** Matches a test file, whatever tier it declares. */
export const TEST_FILE_PATTERN =
  /\.(?:end-to-end|integration|unit)?\.?(?:spec|test)\.[cm]?[jt]sx?$/;
