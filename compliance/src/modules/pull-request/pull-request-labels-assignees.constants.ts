// ♟️ Constants

/** The label that blocks a pull request while present. */
export const DO_NOT_MERGE_LABEL = "do-not-merge";

/** The two labels that may name who opened a pull request. */
export const SOURCE_LABELS = ["source:agent", "source:human"];

/** How the two label families are recognized. */
export const SCOPE_LABEL_PREFIX = "scope:";
export const SOURCE_LABEL_PREFIX = "source:";
export const TYPE_LABEL_PREFIX = "type:";

/** Optional scope: commitlint's scope-empty rule rejects a bare title. */
export const CONVENTIONAL_TITLE_PATTERN =
  /^([a-z][a-z-]*)(?:\(([^()]+)\))?!?:\s+(?<subject>\S.*)$/u;

/** Splits a title's scope as commitlint's scope-enum does, one label each. */
export const TITLE_SCOPE_SEPARATOR_PATTERN = /[,/]/u;
