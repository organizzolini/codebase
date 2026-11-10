import { Injectable } from "@nestjs/common";
import pluralize from "pluralize";
import lemmatizer from "wink-lemmatizer";

import { TERM_LENGTH_PATTERN } from "../words/words.constants";

import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

/**
 * Folds the surface forms of a word into one headword, so the glossary lists
 * a term once however the code inflects it.
 *
 * Plurals fold into their singular and inflected verbs into their lemma:
 * `aspects` into `aspect`, `configured` and `configuring` into `configure`.
 * Derivational families stay apart, so `configuration` keeps its own entry —
 * unless the configuration's own `fold` merges them.
 */
@Injectable()
export class FoldingService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * The headword a lowercase word folds into: its singular, then its lemma. A one-letter result is refused, since one-letter words are not terms.
   */
  fold(word: string): string {
    const folded = lemmatizer.verb(pluralize.singular(word));

    return TERM_LENGTH_PATTERN.test(folded) ? folded : word;
  }

  /**
   * The headword a word is listed under: folded, then passed through the configuration's `fold` when it has one. Faults name the file.
   */
  headword(
    word: string,
    configuration: ResolvedCoinagerieConfiguration,
  ): string {
    const folded = this.fold(word);

    return configuration.fold === undefined
      ? folded
      : configuration.fold(folded);
  }
}
