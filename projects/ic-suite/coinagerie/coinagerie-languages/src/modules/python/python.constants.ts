// ♟️ Constants

import { NUMBER_RULE, PLAIN_IDENTIFIER } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions Python source and stub files are written with. */
export const PYTHON_EXTENSIONS: readonly string[] = [".py", ".pyi"];

/**
 * A string followed by a colon is a dictionary key; a compared string, as in
 * `if kind == "circle":`, is a value.
 */
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

/**
 * The reserved words and literals of Python, lowercased. Hard keywords only:
 * soft keywords such as `match` are common words outside one position.
 */
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
