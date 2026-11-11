// ♟️ Constants

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions JSON documents are written with. */
export const JSON_EXTENSIONS: readonly string[] = [".json", ".jsonc"];

/** JSONC comments; strings before a colon are keys. */
export const JSON_GRAMMAR: LexicalGrammar = {
  keys: [{ after: /\s*:/y }],
  rules: [
    { kind: "comment", pattern: /\/\/[^\n]*/y },
    { kind: "comment", pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    { kind: "string", pattern: /"((?:\\.|[^"\\\n])*)"?/y },
  ],
};

/** JSON literal words, lowercased. Spreading into `exclude.words` excludes nothing extra. */
export const JSON_KEYWORDS: string[] = ["false", "null", "true"];
