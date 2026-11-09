// ♟️ Constants

import type { YamlHit, YamlRule } from "./yaml.types";

/** The extensions YAML documents are written with. */
export const YAML_EXTENSIONS: readonly string[] = [".yaml", ".yml"];

/**
 * Rules tried in order at each position of a line. Only keys are kept, and flow
 * mappings read the same as block ones.
 */
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

/**
 * The literal words of YAML, lowercased. A plain array, so spreading it into
 * `exclude.words` excludes nothing extra.
 */
export const YAML_KEYWORDS: string[] = ["false", "null", "true"];
