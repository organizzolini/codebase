// ♟️ Constants

import type { ResolvedCallidescopeWriteConfiguration } from "@callidescope/configuration";

/** How each anchored destination draws its stacks. One list, so `mermaid` can never start printing trees by accident. */
export const MARKDOWN_DESTINATION_RENDERINGS = [
  ["markdown", "tree"],
  ["mermaid", "diagram"],
] as const satisfies readonly (readonly [
  keyof ResolvedCallidescopeWriteConfiguration,
  "diagram" | "tree",
])[];
