// ♟️ Constants

import { NUMBER_RULE } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions HCL configuration is written with. */
export const HCL_EXTENSIONS: readonly string[] = [".hcl", ".tf", ".tfvars"];

/**
 * Comments, quoted strings, and here-documents in HCL. A quoted key or block label is
 * a name; an interpolation stays inside its string.
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
 * The keywords of HCL, lowercased. Its own words, not Terraform's: `resource`
 * and `variable` are block types HCL does not reserve.
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
