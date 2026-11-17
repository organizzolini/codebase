import { Injectable } from "@nestjs/common";

import {
  CAPITAL_LETTER_PATTERN,
  COMBINING_MARKS_PATTERN,
  DIPHTHONG_PATTERN,
} from "./literature.constants";

/** Normalizes words to the form the word cache is keyed by. */
@Injectable()
export class LiteratureWordNormalizationService {
  // 🏗 Dependency Injection

  public constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Escapes capitals as an underscore and the lowercase letter, matching how
   * the dictionary stores words whose case is meaningful.
   */
  public escapeCapitals(word: string): string {
    return word.replaceAll(
      CAPITAL_LETTER_PATTERN,
      (character) => `_${character.toLowerCase()}`,
    );
  }

  /**
   * Spells a word the way Latin spellings that differ in only u/v, i/j, or a
   * ligature all agree on: normalized, with u for v, i for j, and ae and oe
   * for the æ and œ ligatures.
   */
  public fold(word: string): string {
    return this.normalize(word)
      .replaceAll("æ", "ae")
      .replaceAll("œ", "oe")
      .replaceAll("v", "u")
      .replaceAll("j", "i");
  }

  /** Reads ae and oe as e, the way medieval spelling writes them; apply it to a folded word. */
  public foldDiphthongs(foldedWord: string): string {
    return foldedWord.replaceAll(DIPHTHONG_PATTERN, "e");
  }

  /** Strips diacritics, lowercases, and trims, so lookups ignore accents. */
  public normalize(value: string): string {
    return value
      .normalize("NFD")
      .replaceAll(COMBINING_MARKS_PATTERN, "")
      .toLowerCase()
      .trim();
  }
}
