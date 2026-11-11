// ♟️ Constants

import {
  FILE_IMPORTS_MARKDOWN_SUBHEADING,
  NESTJS_MODULES_MARKDOWN_SUBHEADING,
  NX_PROJECTS_MARKDOWN_SUBHEADING,
} from "../graph-run/graph-run.constants";

import type { CodependixGraphType } from "@codependix/configuration";

/** Anchor and JSON key for the boundary report, unlike graph types. */
export const BOUNDARIES_KEY = "boundaries";

/** `### <subheading>` placed above the boundary report's anchor. */
export const BOUNDARIES_MARKDOWN_SUBHEADING = "Boundaries";

/** What `--format json` prints: every active graph type's data, keyed by type. */
export const FORMAT_JSON = "json";

/** What `--format markdown` prints, and the default; not a configured field. */
export const FORMAT_MARKDOWN = "markdown";

/** Every `--format` value, in error-message order; `parseFormat` validates against it. */
export const FORMAT_NAMES = [FORMAT_JSON, FORMAT_MARKDOWN] as const;

/** Each graph type's section heading in combined output, keyed by type. */
export const GRAPH_TYPE_MARKDOWN_SUBHEADINGS: Record<
  CodependixGraphType,
  string
> = {
  fileImports: FILE_IMPORTS_MARKDOWN_SUBHEADING,
  nestjsModules: NESTJS_MODULES_MARKDOWN_SUBHEADING,
  nxProjects: NX_PROJECTS_MARKDOWN_SUBHEADING,
};
