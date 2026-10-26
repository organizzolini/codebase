import { Injectable } from "@nestjs/common";

import type { KeyPattern, LexicalGrammar, LexicalToken } from "./scanner.types";

/**
 * Reads the identifiers of a language that has no parser here, with nothing
 * but its comment, string, and key syntax.
 *
 * A lexical scanner rather than a syntax tree, so it never judges grammar:
 * it walks the text once, skips what the language says is a comment or a
 * string, and reports every name left over. A quoted string that proves to
 * be a key — the grammar says what follows one — is reported too, since a
 * key is a name the author chose. A language can move to a real parser later
 * without any caller changing, because the contract is the same list of raw
 * identifiers.
 */
@Injectable()
export class ScannerService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether a matched string is a key, by any of the grammar's patterns. */
  private isKey(
    content: string,
    match: RegExpExecArray,
    keys: readonly KeyPattern[],
  ): boolean {
    const end = match.index + match[0].length;
    const lineStart = content.lastIndexOf("\n", match.index - 1) + 1;
    const linePrefix = content.slice(lineStart, match.index);

    for (const { after, before } of keys) {
      after.lastIndex = end;

      if (
        (before === undefined || before.test(linePrefix)) &&
        after.test(content)
      ) {
        return true;
      }
    }

    return false;
  }

  /** Whether the text at `index` matches a sticky pattern. */
  private matchAt(
    pattern: RegExp,
    content: string,
    index: number,
  ): null | RegExpExecArray {
    pattern.lastIndex = index;

    return pattern.exec(content);
  }

  /** The token at `index`, or `undefined` when only punctuation is there. */
  private readToken(
    content: string,
    index: number,
    grammar: LexicalGrammar,
  ): LexicalToken | undefined {
    for (const { kind, pattern } of grammar.rules) {
      const match = this.matchAt(pattern, content, index);

      if (match === null) {
        continue;
      }

      const named =
        kind === "identifier" ||
        (kind === "string" && this.isKey(content, match, grammar.keys));

      return {
        identifier: named ? match[1] : undefined,
        length: match[0].length,
      };
    }

    const bare =
      grammar.identifier === undefined
        ? null
        : this.matchAt(grammar.identifier, content, index);

    return bare === null
      ? undefined
      : { identifier: bare[0], length: bare[0].length };
  }

  // 🌎 Public Methods

  /**
   * Every identifier in a file written in the grammar's language, in the
   * order written, repeats kept.
   */
  scan(content: string, grammar: LexicalGrammar): string[] {
    const identifiers: string[] = [];
    let index = 0;

    while (index < content.length) {
      const token = this.readToken(content, index, grammar);

      if (token?.identifier !== undefined && token.identifier.length > 0) {
        identifiers.push(token.identifier);
      }

      index += Math.max(token?.length ?? 1, 1);
    }

    return identifiers;
  }
}
