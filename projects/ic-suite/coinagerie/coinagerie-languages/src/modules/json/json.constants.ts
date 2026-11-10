// ♟️ Constants

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions JSON documents are written with. */
export const JSON_EXTENSIONS: readonly string[] = [".json", ".jsonc"];

/**
 * Comments (JSONC) and quoted strings. A string followed by a colon is a key;
 * values are never names.
 */
export const JSON_GRAMMAR: LexicalGrammar = {
  keys: [{ after: /\s*:/y }],
  rules: [
    { kind: "comment", pattern: /\/\/[^\n]*/y },
    { kind: "comment", pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    { kind: "string", pattern: /"((?:\\.|[^"\\\n])*)"?/y },
  ],
};

/**
 * The literal words of JSON, lowercased. A plain array, so spreading it into
 * `exclude.words` excludes nothing extra.
 */
export const JSON_KEYWORDS: string[] = ["false", "null", "true"];
