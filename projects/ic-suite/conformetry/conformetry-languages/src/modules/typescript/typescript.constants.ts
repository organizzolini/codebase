// ♟️ Constants

import type { LanguageValidatorDescriptor } from "@conformetry/core";

/** Extensions the TypeScript validator claims. */
export const TYPESCRIPT_VALIDATOR_FILE_EXTENSIONS = [".ts", ".tsx"];

/** Identifies the TypeScript language to the orchestrator and the `--languages` filter. */
export const TYPESCRIPT_VALIDATOR_DESCRIPTOR: LanguageValidatorDescriptor = {
  description: "Checks TypeScript AST structure and required comments",
  fileExtensions: TYPESCRIPT_VALIDATOR_FILE_EXTENSIONS,
  name: "typescript",
};

/**
 * Marks a comment as a placeholder. Any instance comment satisfies a `TODO`
 * template comment, a prompt rather than text to copy.
 */
export const TODO_COMMENT_PATTERN = /\bTODO\b/u;
