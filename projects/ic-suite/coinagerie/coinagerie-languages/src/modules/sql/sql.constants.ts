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

/**
 * The reserved words of standard SQL and its common dialects, lowercased as
 * the vocabulary compares words.
 *
 * A plain array, so a configuration spreads it into `exclude.words` and the
 * tool excludes nothing it was not asked to.
 */
export const SQL_KEYWORDS: string[] = [
  "add",
  "all",
  "alter",
  "and",
  "any",
  "as",
  "asc",
  "authorization",
  "begin",
  "between",
  "by",
  "case",
  "cast",
  "check",
  "column",
  "commit",
  "constraint",
  "create",
  "cross",
  "current",
  "cursor",
  "database",
  "declare",
  "default",
  "delete",
  "desc",
  "distinct",
  "drop",
  "else",
  "elsif",
  "end",
  "except",
  "exists",
  "fetch",
  "for",
  "foreign",
  "from",
  "full",
  "function",
  "grant",
  "group",
  "having",
  "if",
  "in",
  "index",
  "inner",
  "insert",
  "intersect",
  "into",
  "is",
  "join",
  "key",
  "language",
  "left",
  "like",
  "limit",
  "loop",
  "materialized",
  "not",
  "null",
  "offset",
  "on",
  "or",
  "order",
  "outer",
  "primary",
  "procedure",
  "references",
  "return",
  "returns",
  "revoke",
  "right",
  "rollback",
  "row",
  "rows",
  "schema",
  "select",
  "set",
  "table",
  "then",
  "to",
  "transaction",
  "trigger",
  "truncate",
  "union",
  "unique",
  "update",
  "using",
  "values",
  "view",
  "when",
  "where",
  "while",
  "with",
];
