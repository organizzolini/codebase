// ♟️ Constants

import { NUMBER_RULE } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions HCL configuration is written with. */
export const HCL_EXTENSIONS: readonly string[] = [".hcl", ".tf", ".tfvars"];

/**
 * How HCL is read: `#`, `//`, and block comments, quoted strings, and
 * here-document bodies.
 *
 * Two kinds of quoted string are names. An object key written
 * `"key" = value`, and a block label such as the `"aws_instance"` and `"web"`
 * of `resource "aws_instance" "web" {`, found by the block header on the same
 * line before it. Interpolations inside a string are part of the string.
 */
export const HCL_GRAMMAR: LexicalGrammar = {
  identifier: /[\p{L}_][\p{L}\p{N}_-]*/uy,
  keys: [
    { after: /[ \t]*=(?![=>])/y },
    {
      after: /[ \t]*[{"]/y,
      before: /^[ \t]*[\p{L}_][\p{L}\p{N}_-]*(?:[ \t]+"[^"\n]*")*[ \t]*$/u,
    },
  ],
  rules: [
    { kind: "comment", pattern: /#[^\n]*/y },
    { kind: "comment", pattern: /\/\/[^\n]*/y },
    { kind: "comment", pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    {
      kind: "comment",
      pattern:
        /<<-?([\p{L}_][\p{L}\p{N}_]*)[^\n]*(?:[\s\S]*?\n[ \t]*\1[ \t]*(?=\n|$)|[\s\S]*)/uy,
    },
    { kind: "string", pattern: /"((?:\\.|[^"\\\n])*)"?/y },
    NUMBER_RULE,
  ],
};

/**
 * The keywords of HCL, lowercased as the vocabulary compares words.
 *
 * The language's own words, not Terraform's: `resource` and `variable` are
 * block types a Terraform configuration chooses, and HCL does not reserve
 * them.
 *
 * A plain array, so a configuration spreads it into `exclude.words` and the
 * tool excludes nothing it was not asked to.
 */
export const HCL_KEYWORDS: string[] = [
  "else",
  "endfor",
  "endif",
  "false",
  "for",
  "if",
  "in",
  "null",
  "true",
];
