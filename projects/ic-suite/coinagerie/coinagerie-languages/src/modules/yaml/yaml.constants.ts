// ♟️ Constants

import type { YamlHit, YamlRule } from "./yaml.types";

/** The extensions YAML documents are written with. */
export const YAML_EXTENSIONS: readonly string[] = [".yaml", ".yml"];

/** Ordered rules; keep only keys, flow and block alike. */
export const YAML_RULES: readonly YamlRule[] = [
  { effect: "skip", pattern: /[ \t]+/y },
  { effect: "skip", pattern: /#.*/y },
  { effect: "block", pattern: /[|>][+-]?[0-9]?[+-]?[ \t]*(?:#.*)?$/y },
  { effect: "skip", pattern: /[-?](?=[ \t]|$)/y },
  { effect: "skip", pattern: /[&*!][^\s,[\]{}]*/y },
  {
    effect: "key",
    pattern: /"((?:\\.|[^"\\])*)"[ \t]*:/y,
  },
  {
    effect: "key",
    pattern: /'((?:[^']|'')*)'[ \t]*:/y,
  },
  { effect: "skip", pattern: /"(?:\\.|[^"\\])*"?/y },
  { effect: "skip", pattern: /'(?:[^']|'')*'?/y },
  {
    effect: "key",
    pattern:
      /((?:[^\s#,[\]{}&*!|>'"%@`:?-]|[-?:][^\s,[\]{}])(?:[^:#,[\]{}]|:(?![ \t]|$))*?)[ \t]*:(?=[ \t]|$)/y,
  },
  { effect: "skip", pattern: /[,[\]{}:]/y },
  { effect: "skip", pattern: /[^\s#,[\]{}][^#,[\]{}]*/y },
];

/** What a position that no rule matches counts as: one skipped character. */
export const YAML_UNMATCHED: YamlHit = { effect: "skip", keys: [], length: 1 };

/** YAML literal words, lowercased. Spreading into `exclude.words` excludes nothing extra. */
export const YAML_KEYWORDS: string[] = ["false", "null", "true"];
