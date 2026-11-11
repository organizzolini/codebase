// ♟️ Constants

import type { ResolvedCallidescopeWriteConfiguration } from "@callidescope/configuration";

/** How each anchored destination draws stacks. Keeps `mermaid` from printing trees. */
export const MARKDOWN_DESTINATION_RENDERINGS = [
  ["markdown", "tree"],
  ["mermaid", "diagram"],
] as const satisfies readonly (readonly [
  keyof ResolvedCallidescopeWriteConfiguration,
  "diagram" | "tree",
])[];
