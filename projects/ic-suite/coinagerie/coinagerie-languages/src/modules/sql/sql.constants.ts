// ♟️ Constants

import { NUMBER_RULE } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions SQL scripts are written with. */
export const SQL_EXTENSIONS: readonly string[] = [".sql"];

/**
 * How SQL is read: `--` and block comments, single quoted strings with a
 * doubled quote as the escape, and dollar quoted bodies.
 *
 * A double quoted or backtick quoted name is an identifier in SQL, not text, so it
 * contributes its content. SQL has no key separator, so no string is ever a
 * key.
 */
export const SQL_GRAMMAR: LexicalGrammar = {
  identifier: /[\p{L}_][\p{L}\p{N}_$]*/uy,
  keys: [],
  rules: [
    { kind: "comment", pattern: /--[^\n]*/y },
    { kind: "comment", pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    { kind: "comment", pattern: /[EeNnBbXx](?=')/y },
    {
      kind: "string",
      pattern: /\$([\p{L}_][\p{L}\p{N}_]*)?\$[\s\S]*?(?:\$\1\$|$)/uy,
    },
    { kind: "string", pattern: /'(?:[^']|'')*'?/y },
    { kind: "identifier", pattern: /"((?:[^"]|"")*)"?/y },
    { kind: "identifier", pattern: /`((?:[^`]|``)*)`?/y },
    NUMBER_RULE,
  ],
};
