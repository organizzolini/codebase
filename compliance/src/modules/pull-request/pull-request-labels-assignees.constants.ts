// ♟️ Constants

/** The label blocking a pull request for as long as it is present. */
export const DO_NOT_MERGE_LABEL = "do-not-merge";

/** The two labels that may declare who opened a pull request, and nothing else. */
export const SOURCE_LABELS = ["source:agent", "source:human"];

/** How the two label families are recognized. */
export const SCOPE_LABEL_PREFIX = "scope:";
export const SOURCE_LABEL_PREFIX = "source:";
export const TYPE_LABEL_PREFIX = "type:";

/**
 * Scope is optional here because commitlint's `scope-empty` rejects a title with no scope,
 * titles first; this keeps a by-hand run correct. Subject is required.
 */
export const CONVENTIONAL_TITLE_PATTERN =
  /^([a-z][a-z-]*)(?:\(([^()]+)\))?!?:\s+(?<subject>\S.*)$/u;

/**
 * Splits a title's scope group the way commitlint's `scope-enum` does, so each
 * scope needs its own label.
 */
export const TITLE_SCOPE_SEPARATOR_PATTERN = /[,/]/u;
