// ♟️ Constants

/** Directories a project scan skips: dependency caches and generated output, which hold no project to trace. */
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

/** Marks a project root other projects can depend on. A root holding only a `tsconfig.json` is shared settings, not a destination. */
export const PACKAGE_MANIFEST_NAME = "package.json";

/** The file whose presence makes a directory a project. Named once so discovery and exclusions read the same file. */
export const PROJECT_CONFIGURATION_NAME = "tsconfig.json";

/** Directory holding test scaffolding such as `mocks.ts`; its files exist only for tests, so reports must not count them. */
export const TEST_DIRECTORY_SEGMENT = "testing";

/** Matches a test file, whatever tier it declares. */
export const TEST_FILE_PATTERN =
  /\.(?:end-to-end|integration|unit)?\.?(?:spec|test)\.[cm]?[jt]sx?$/;
