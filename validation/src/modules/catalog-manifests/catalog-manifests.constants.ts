// ♟️ Constants

import type { DependencySectionName } from "./catalog-manifests.types";

/**
 * Dependency sections the catalog policy covers, all four: a version pinned in
 * `peerDependencies` drifts as easily as one in `dependencies`.
 */
export const DEPENDENCY_SECTION_NAMES: DependencySectionName[] = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

/** The directories a workspace project may live in, nested by domain. */
export const WORKSPACE_SCOPES = ["projects"];

/**
 * Root directories that never hold a project: the install, and `projects/`,
 * searched through `WORKSPACE_SCOPES` instead. Hidden ones are skipped.
 */
export const NON_PROJECT_ROOT_DIRECTORIES = ["node_modules", "projects"];

/**
 * The scopes a workspace package name carries. Those must be pinned
 * `workspace:*`; anything else must be pinned `catalog:`.
 */
export const INTERNAL_PACKAGE_SCOPES = [
  "@callidescope/",
  "@codebase/",
  "@codependix/",
  "@codometer/",
  "@coinagerie/",
  "@conformetry/",
  "@jimmypaolini/",
];

/** How an internal dependency must be pinned. */
export const WORKSPACE_PROTOCOL_PREFIX = "workspace:";

/** How an external dependency must be pinned, exactly. */
export const CATALOG_PROTOCOL = "catalog:";

/**
 * Pins the default catalog or a named one. A name is a word, never a range, so
 * `catalog:^3.0.0` is still reported.
 */
export const CATALOG_PIN_PATTERN = /^catalog:(?:[a-z][\w-]*)?$/i;
