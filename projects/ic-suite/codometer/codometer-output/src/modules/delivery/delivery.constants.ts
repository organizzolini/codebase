import {
  DEFAULT_MARKDOWN_END_MARKER,
  DEFAULT_MARKDOWN_START_MARKER,
} from "@codometer/configuration";

import type { ResolvedMarkdownDestination } from "../destinations/destinations.types";

// ♟️ Constants

/** Console fallback markdown destination, rendering the same badges. */
export const DEFAULT_MARKDOWN_DESTINATION: ResolvedMarkdownDestination = {
  custom: [],
  description: undefined,
  endMarker: DEFAULT_MARKDOWN_END_MARKER,
  path: undefined,
  startMarker: DEFAULT_MARKDOWN_START_MARKER,
  type: "markdown",
  write: undefined,
};
