// ♟️ Constants

import type { DependencySectionName } from "./catalog-manifests.types";

/** All four dependency sections: peers drift as easily as dependencies. */
export const DEPENDENCY_SECTION_NAMES: DependencySectionName[] = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

/** The directories a workspace project may live in, nested by domain. */
export const WORKSPACE_SCOPES = ["projects"];

/** Root directories holding no project; hidden ones are skipped. */
export const NON_PROJECT_ROOT_DIRECTORIES = ["node_modules", "projects"];

/** Scopes marking a workspace package; those pin `workspace:*`, others `catalog:`. */
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

/** A `catalog:` pin, default or named. `catalog:^3.0.0` still fails. */
export const CATALOG_PIN_PATTERN = /^catalog:(?:[a-z][\w-]*)?$/i;
