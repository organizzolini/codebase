// ♟️ Constants

import { NUMBER_RULE } from "../scanner/scanner.constants";

import type { LexicalGrammar } from "../scanner/scanner.types";

/** The extensions CSS stylesheets are written with. */
export const CSS_EXTENSIONS: readonly string[] = [".css"];

/**
 * How CSS is read: block comments, quoted strings, and the unquoted body of a
 * `url(…)`, which is a path and not a name.
 *
 * A hexadecimal color is skipped whole, so `#e0e0e0` and `#abc` read as the colors
 * they are; an identifier with a hyphen, such as `font-size` or `--accent`,
 * is one raw identifier. CSS has no key separator, so no string is a key.
 */
export const CSS_GRAMMAR: LexicalGrammar = {
  identifier: /-{0,2}[\p{L}_][\p{L}\p{N}_-]*/uy,
  keys: [],
  rules: [
    { kind: "comment", pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
    { kind: "comment", pattern: /url\([ \t]*(?!["' \t)])[^)\n]*\)?/iy },
    {
      kind: "comment",
      pattern:
        /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\p{L}\p{N}_-])/uy,
    },
    { kind: "string", pattern: /"((?:\\.|[^"\\\n])*)"?/y },
    { kind: "string", pattern: /'((?:\\.|[^'\\\n])*)'?/y },
    NUMBER_RULE,
  ],
};
