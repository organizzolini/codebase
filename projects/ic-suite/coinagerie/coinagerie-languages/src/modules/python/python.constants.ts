// ♟️ Constants

import { NUMBER_RULE, PLAIN_IDENTIFIER } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions Python source and stub files are written with. */
export const PYTHON_EXTENSIONS: readonly string[] = [".py", ".pyi"];

/** Strings before a colon are keys; compared strings are values. */
export const PYTHON_GRAMMAR: LexicalGrammar = {
  identifier: PLAIN_IDENTIFIER,
  keys: [
    {
      after: /:/y,
      before: /^(?!.*(?:\b(?:if|elif|while|case|assert)\b|[=!]=))/,
    },
  ],
  rules: [
    { kind: "comment", pattern: /#[^\n]*/y },
    {
      kind: "comment",
      pattern: /(?:[rR][bBfF]|[bBfF][rR]|[rRbBuUfF])(?=["'])/y,
    },
    {
      kind: "string",
      pattern: /"""((?:\\[\s\S]|[^\\])*?)(?:"""|$)/y,
    },
    {
      kind: "string",
      pattern: /'''((?:\\[\s\S]|[^\\])*?)(?:'''|$)/y,
    },
    { kind: "string", pattern: /"((?:\\.|[^"\\\n])*)"?/y },
    { kind: "string", pattern: /'((?:\\.|[^'\\\n])*)'?/y },
    NUMBER_RULE,
  ],
};

/** Python hard keywords and literals, lowercased. Soft keywords excluded. */
export const PYTHON_KEYWORDS: string[] = [
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "false",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "none",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "true",
  "try",
  "while",
  "with",
  "yield",
];
