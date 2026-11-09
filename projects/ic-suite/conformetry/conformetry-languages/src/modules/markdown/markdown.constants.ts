// ♟️ Constants

import type { LanguageValidatorDescriptor } from "@conformetry/core";

/** Extensions the markdown validator claims. */
export const MARKDOWN_VALIDATOR_FILE_EXTENSIONS = [".md"];

/** Identifies the markdown language to the orchestrator and the `--languages` filter. */
export const MARKDOWN_VALIDATOR_DESCRIPTOR: LanguageValidatorDescriptor = {
  description: "Checks markdown structural conformance using mdast",
  fileExtensions: MARKDOWN_VALIDATOR_FILE_EXTENSIONS,
  name: "markdown",
};

/**
 * Node types whose children carry the meaning. Matched by descending into them,
 * so a heading inside a list item is still required.
 */
export const CONTAINER_TYPES = new Set<string>([
  "blockquote",
  "document",
  "list",
  "listItem",
  "root",
  "table",
  "tableCell",
  "tableRow",
]);

/**
 * Node types skipped while walking. Text runs are compared within their parent,
 * so matching them alone would double-report.
 */
export const SKIPPED_TYPES = new Set<string>(["text"]);
