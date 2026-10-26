// ♟️ Constants

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions JSON documents are written with. */
export const JSON_EXTENSIONS: readonly string[] = [".json", ".jsonc"];

/**
 * How JSON is read: comments, which JSONC allows, and quoted strings.
 *
 * A string followed by a colon is a key, and every key is an identifier. A
 * value is never a name, and neither is a bare literal such as `true`, so the
 * grammar has no identifier pattern at all.
 */
export const JSON_GRAMMAR: LexicalGrammar = {
  keys: [{ after: /\s*:/y }],
  rules: [
    { kind: "comment", pattern: /\/\/[^\n]*/y },
    { kind: "comment", pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    { kind: "string", pattern: /"((?:\\.|[^"\\\n])*)"?/y },
  ],
};
