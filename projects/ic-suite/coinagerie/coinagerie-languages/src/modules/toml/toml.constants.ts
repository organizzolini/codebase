// ♟️ Constants

import { NUMBER_RULE } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions TOML documents are written with. */
export const TOML_EXTENSIONS: readonly string[] = [".toml"];

/** `#` comments; quoted strings before `=` or `.` are keys. */
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

/** TOML literal words, lowercased. Spreading into `exclude.words` excludes nothing extra. */
export const TOML_KEYWORDS: string[] = ["false", "inf", "nan", "true"];
