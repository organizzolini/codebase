import path from "node:path";
import { fileURLToPath } from "node:url";

// ♟️ Constants

/**
 * This package's root, resolved from this file rather than the working
 * directory, which the two callers do not agree on.
 */
export const PROJECT_ROOT_DIRECTORY = path.resolve(
  fileURLToPath(import.meta.url),
  "../../..",
);

/**
 * Directory every example lives in, subject and guide together. Committed, so
 * readers see output without running anything.
 */
export const EXAMPLES_DIRECTORY = path.join(PROJECT_ROOT_DIRECTORY, "examples");

/** Resolves one example subject's absolute root. */
export const resolveExample = (...segments: string[]): string =>
  path.join(EXAMPLES_DIRECTORY, ...segments);

/**
 * Prefix every anchor name in this package carries. Real runs claim the
 * `codependix-*` anchors, so an example must never print one of those names.
 */
export const EXAMPLE_ANCHOR_PREFIX = "example";

/** Builds an anchor name no real codependix run will ever claim. */
export const buildExampleAnchor = (suffix: string): string =>
  `${EXAMPLE_ANCHOR_PREFIX}-${suffix}`;
