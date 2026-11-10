import {
  DEFAULT_MARKDOWN_END_MARKER,
  DEFAULT_MARKDOWN_START_MARKER,
} from "@codometer/configuration";

import type { ResolvedMarkdownDestination } from "../destinations/destinations.types";

// ♟️ Constants

/**
 * The markdown destination the console falls back to.
 *
 * Renders the badge block a configuration would write, identically.
 */
export const DEFAULT_MARKDOWN_DESTINATION: ResolvedMarkdownDestination = {
  custom: [],
  description: undefined,
  endMarker: DEFAULT_MARKDOWN_END_MARKER,
  path: undefined,
  startMarker: DEFAULT_MARKDOWN_START_MARKER,
  type: "markdown",
  write: undefined,
};
