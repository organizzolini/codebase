// ♟️ Constants

import { NUMBER_RULE } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions TOML documents are written with. */
export const TOML_EXTENSIONS: readonly string[] = [".toml"];

/**
 * `#` comments, and the four string kinds. A quoted string is a key before `=`
 * or `.`, including in a table header.
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
 * The literal words of TOML, lowercased. A plain array, so spreading it into
 * `exclude.words` excludes nothing extra.
 */
export const TOML_KEYWORDS: string[] = ["false", "inf", "nan", "true"];
