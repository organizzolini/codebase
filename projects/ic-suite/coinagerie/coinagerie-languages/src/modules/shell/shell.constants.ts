// ♟️ Constants

import { NUMBER_RULE, PLAIN_IDENTIFIER } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions shell scripts are written with. */
export const SHELL_EXTENSIONS: readonly string[] = [
  ".bash",
  ".ksh",
  ".sh",
  ".zsh",
];

/**
 * How shell is read: `#` comments only where a word could begin, single,
 * double, and `$'…'` strings, here-documents, and backslash escapes.
 *
 * The only key shell has is an associative array subscript, `["key"]=value`,
 * so a string followed by `]=` is a key.
 */
export const SHELL_GRAMMAR: LexicalGrammar = {
  identifier: PLAIN_IDENTIFIER,
  keys: [{ after: /\]=/y }],
  rules: [
    { kind: "comment", pattern: /\\[\s\S]/y },
    { kind: "comment", pattern: /(?<=^|[\s;&|()])#[^\n]*/y },
    {
      kind: "comment",
      pattern:
        /(?<!<)<<(?!<)-?[ \t]*(['"]?)([\p{L}_][\p{L}\p{N}_]*)\1[^\n]*(?:[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)|[\s\S]*)/uy,
    },
    { kind: "string", pattern: /\$'((?:\\[\s\S]|[^'\\])*)'?/y },
    { kind: "string", pattern: /'([^']*)'?/y },
    { kind: "string", pattern: /"((?:\\[\s\S]|[^"\\])*)"?/y },
    NUMBER_RULE,
  ],
};
