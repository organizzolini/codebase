// ♟️ Constants

import { NUMBER_RULE } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions TOML documents are written with. */
export const TOML_EXTENSIONS: readonly string[] = [".toml"];

/**
 * How TOML is read: `#` comments and the four kinds of string.
 *
 * A quoted string is a key when `=` or a dotted path follows it, and also in
 * a table header such as `[servers."alpha"]`, where only the line's start
 * tells it from the end of an array value. A date or time is read as a
 * number, so its `T` and `Z` are not names.
 */
export const TOML_GRAMMAR: LexicalGrammar = {
  identifier: /[\p{L}_][\p{L}\p{N}_-]*/uy,
  keys: [
    { after: /[ \t]*[=.]/y },
    {
      after: /[ \t]*(?:\.|\]\]?)/y,
      before: /^[ \t]*\[\[?[ \t]*(?:[\p{L}\p{N}_-]+[ \t]*\.[ \t]*)*$/u,
    },
  ],
  rules: [
    { kind: "comment", pattern: /#[^\n]*/y },
    { kind: "string", pattern: /"""((?:\\[\s\S]|[^\\])*?)(?:"""|$)/y },
    { kind: "string", pattern: /'''([\s\S]*?)(?:'''|$)/y },
    { kind: "string", pattern: /"((?:\\.|[^"\\\n])*)"?/y },
    { kind: "string", pattern: /'([^'\n]*)'?/y },
    NUMBER_RULE,
  ],
};

/**
 * The literal words of TOML, lowercased as the vocabulary compares words.
 *
 * A plain array, so a configuration spreads it into `exclude.words` and the
 * tool excludes nothing it was not asked to.
 */
export const TOML_KEYWORDS: string[] = ["false", "inf", "nan", "true"];
