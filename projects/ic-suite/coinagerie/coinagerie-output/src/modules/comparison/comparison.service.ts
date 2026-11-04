import { Injectable } from "@nestjs/common";

import type { Comparison } from "./comparison.types";
import type { Glossary } from "@coinagerie/core";

/**
 * Compares a glossary with the codebase's vocabulary, and reconciles one to
 * the other. Only words are compared: an empty definition is never a
 * disagreement.
 */
@Injectable()
export class ComparisonService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** The words missing from the glossary and the words stale in it. */
  compare(words: string[], glossary: Glossary): Comparison {
    const vocabulary = new Set(words);

    return {
      missing: words.filter((word) => !glossary.has(word)).toSorted(),
      stale: [...glossary.keys()]
        .filter((word) => !vocabulary.has(word))
        .toSorted(),
    };
  }

  /**
   * The glossary as `--write` leaves it: exactly the vocabulary, sorted, each
   * word keeping the definition it had and a new word starting empty. Stale
   * words are dropped with their definitions.
   */
  reconcile(words: string[], glossary: Glossary): Glossary {
    return new Map(
      words.toSorted().map((word) => [word, glossary.get(word) ?? ""]),
    );
  }
}
