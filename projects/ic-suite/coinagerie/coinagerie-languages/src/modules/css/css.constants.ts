// ♟️ Constants

import { NUMBER_RULE } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions CSS stylesheets are written with. */
export const CSS_EXTENSIONS: readonly string[] = [".css"];

/**
 * Hex colors are skipped whole, so `#abc` is not a name; a `url(…)` body is a
 * path. CSS has no keys.
 */
export const CSS_GRAMMAR: LexicalGrammar = {
  identifier: /-{0,2}[\p{L}_][\p{L}\p{N}_-]*/uy,
  keys: [],
  rules: [
    { kind: "comment", pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    { kind: "comment", pattern: /url\([ \t]*(?!["' \t)])[^)\n]*\)?/iy },
    {
      kind: "comment",
      pattern:
        /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\p{L}\p{N}_-])/uy,
    },
    { kind: "string", pattern: /"((?:\\.|[^"\\\n])*)"?/y },
    { kind: "string", pattern: /'((?:\\.|[^'\\\n])*)'?/y },
    NUMBER_RULE,
  ],
};

/**
 * CSS at-rule names and global values, lowercased. Multi-word at-rules are
 * omitted, as the vocabulary splits them into common words.
 */
export const CSS_KEYWORDS: string[] = [
  "and",
  "charset",
  "container",
  "document",
  "import",
  "important",
  "inherit",
  "initial",
  "keyframes",
  "layer",
  "media",
  "namespace",
  "not",
  "only",
  "or",
  "page",
  "property",
  "revert",
  "scope",
  "starting",
  "supports",
  "unset",
];
