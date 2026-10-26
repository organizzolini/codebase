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
