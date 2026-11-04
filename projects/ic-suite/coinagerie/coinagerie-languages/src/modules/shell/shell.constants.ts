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
        /(?<!<)<<(?!<)-?[ \t]*(['"]?)([\p{L}_][\p{L}\p{N}_]*)\1[^\n]*(?:[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$))/uy,
    },
    { kind: "string", pattern: /\$'((?:\\[\s\S]|[^'\\])*)'?/y },
    { kind: "string", pattern: /'([^']*)'?/y },
    { kind: "string", pattern: /"((?:\\[\s\S]|[^"\\])*)"?/y },
    NUMBER_RULE,
  ],
};

/**
 * The reserved words and builtin commands of POSIX shell and Bash, lowercased
 * as the vocabulary compares words.
 *
 * A plain array, so a configuration spreads it into `exclude.words` and the
 * tool excludes nothing it was not asked to.
 */
export const SHELL_KEYWORDS: string[] = [
  "alias",
  "break",
  "builtin",
  "case",
  "cd",
  "command",
  "continue",
  "declare",
  "do",
  "done",
  "echo",
  "elif",
  "else",
  "esac",
  "eval",
  "exec",
  "exit",
  "export",
  "false",
  "fc",
  "fg",
  "fi",
  "for",
  "function",
  "getopts",
  "hash",
  "if",
  "in",
  "jobs",
  "kill",
  "let",
  "local",
  "popd",
  "printf",
  "pushd",
  "pwd",
  "read",
  "readonly",
  "return",
  "select",
  "set",
  "shift",
  "shopt",
  "source",
  "test",
  "then",
  "time",
  "times",
  "trap",
  "true",
  "type",
  "typeset",
  "ulimit",
  "umask",
  "unalias",
  "unset",
  "until",
  "wait",
  "while",
];
