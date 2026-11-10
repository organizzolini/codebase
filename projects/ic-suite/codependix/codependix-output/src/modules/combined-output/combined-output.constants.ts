// ♟️ Constants

import {
  FILE_IMPORTS_MARKDOWN_SUBHEADING,
  NESTJS_MODULES_MARKDOWN_SUBHEADING,
  NX_PROJECTS_MARKDOWN_SUBHEADING,
} from "../graph-run/graph-run.constants";

import type { CodependixGraphType } from "@codependix/configuration";

/**
 * Anchor and JSON key for the boundary report. Not a graph type, so it cannot
 * collide with one.
 */
export const BOUNDARIES_KEY = "boundaries";

/** `### <subheading>` placed above the boundary report's anchor. */
export const BOUNDARIES_MARKDOWN_SUBHEADING = "Boundaries";

/** What `--format json` prints: every active graph type's data, keyed by type. */
export const FORMAT_JSON = "json";

/**
 * What `--format markdown` prints, and the default when `--format` is left off.
 * A fixed constant, not a configured field.
 */
export const FORMAT_MARKDOWN = "markdown";

/**
 * Everything `--format` accepts, in error-message order. `MapCommand.parseFormat`
 * validates against this array, so a format added here is accepted everywhere.
 */
export const FORMAT_NAMES = [FORMAT_JSON, FORMAT_MARKDOWN] as const;

/**
 * Each graph type's section heading in a combined destination, keyed by type.
 * The anchor is the type's own name.
 */
export const GRAPH_TYPE_MARKDOWN_SUBHEADINGS: Record<
  CodependixGraphType,
  string
> = {
  fileImports: FILE_IMPORTS_MARKDOWN_SUBHEADING,
  nestjsModules: NESTJS_MODULES_MARKDOWN_SUBHEADING,
  nxProjects: NX_PROJECTS_MARKDOWN_SUBHEADING,
};
