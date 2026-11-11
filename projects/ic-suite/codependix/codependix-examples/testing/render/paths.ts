import path from "node:path";
import { fileURLToPath } from "node:url";

// ♟️ Constants

/** This package's root, resolved from this file, not the cwd. */
export const PROJECT_ROOT_DIRECTORY = path.resolve(
  fileURLToPath(import.meta.url),
  "../../..",
);

/** Directory holding every example; committed so readers need not run. */
export const EXAMPLES_DIRECTORY = path.join(PROJECT_ROOT_DIRECTORY, "examples");

/** Resolves one example subject's absolute root. */
export const resolveExample = (...segments: string[]): string =>
  path.join(EXAMPLES_DIRECTORY, ...segments);

/** Anchor-name prefix; examples must never print real `codependix-*` names. */
export const EXAMPLE_ANCHOR_PREFIX = "example";

/** Builds an anchor name no real codependix run will ever claim. */
export const buildExampleAnchor = (suffix: string): string =>
  `${EXAMPLE_ANCHOR_PREFIX}-${suffix}`;
