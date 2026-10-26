// ♟️ Constants

import { NUMBER_RULE, PLAIN_IDENTIFIER } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions Python source and stub files are written with. */
export const PYTHON_EXTENSIONS: readonly string[] = [".py", ".pyi"];

/**
 * How Python is read: `#` comments, single and triple quoted strings with
 * backslash escapes, and a dictionary key as a string followed by a colon.
 *
 * A string prefix such as `r` or `f` is skipped on its own, so the letter is
 * not read as a name. Docstrings are strings, and so contribute nothing.
 */
export const PYTHON_GRAMMAR: LexicalGrammar = {
  identifier: PLAIN_IDENTIFIER,
  keys: [{ after: /:/y }],
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
 * The reserved words and literals of Python, lowercased as the vocabulary
 * compares words.
 *
 * The hard keywords only: a soft keyword such as `match` or `type` is a
 * keyword only in one position, and it is a common word everywhere else.
 *
 * A plain array, so a configuration spreads it into `exclude.words` and the
 * tool excludes nothing it was not asked to.
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
