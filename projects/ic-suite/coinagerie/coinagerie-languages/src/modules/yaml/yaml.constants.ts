// ♟️ Constants

import type { YamlHit, YamlRule } from "./yaml.types";

/** The extensions YAML documents are written with. */
export const YAML_EXTENSIONS: readonly string[] = [".yaml", ".yml"];

/**
 * What YAML contains, tried in order at each position of a line.
 *
 * A key is a quoted or plain scalar followed by a colon and a space, or by
 * the end of the line, and is the only thing read. Every other scalar is a
 * value and is skipped, as are comments, anchors and tags, and the flow marks
 * `[ ] { } ,` that hold a line's keys together. Nothing here depends on
 * indentation or on how deep a flow collection nests, so a flow mapping such
 * as `{ a: 1, b: 2 }` yields its keys the same way a block mapping does.
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
 * The literal words of YAML, lowercased as the vocabulary compares words.
 *
 * A plain array, so a configuration spreads it into `exclude.words` and the
 * tool excludes nothing it was not asked to.
 */
export const YAML_KEYWORDS: string[] = ["false", "null", "true"];
