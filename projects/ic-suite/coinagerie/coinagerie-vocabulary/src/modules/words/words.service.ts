import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  NUMBER_PATTERN,
  SEPARATOR_PATTERN,
  TERM_LENGTH_PATTERN,
  WORD_PART_PATTERN,
} from "./words.constants";

/**
 * Splits names into the words a glossary lists.
 *
 * A word leaves here lowercase, at least two characters long, and not a bare
 * number. It is not yet folded: `aspects` and `aspect` are still two words.
 */
@Injectable()
export class WordsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether a lowercase word is a term rather than noise. */
  private isTerm(word: string): boolean {
    return TERM_LENGTH_PATTERN.test(word) && !NUMBER_PATTERN.test(word);
  }

  // 🌎 Public Methods

  /**
   * The words of one identifier, in order, repeats kept. Splits on separators and case changes, keeping acronyms whole: `XMLHttpRequest` is `xml`, `http`, and `request`.
   */
  splitIdentifier(raw: string): string[] {
    return raw
      .split(SEPARATOR_PATTERN)
      .flatMap((chunk) => chunk.match(WORD_PART_PATTERN) ?? [])
      .map((part) => part.toLowerCase())
      .filter((word) => this.isTerm(word));
  }

  /**
   * The words of a relative file path: every folder name, plus the file name without its final extension.
   */
  splitPath(relativePath: string): string[] {
    // A path separator is a word separator too, so the whole path splits at
    // once once its final extension is gone.
    return this.splitIdentifier(
      relativePath.slice(
        0,
        relativePath.length - path.extname(relativePath).length,
      ),
    );
  }
}
