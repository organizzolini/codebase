// 🏷️ Types

import type { categories } from "./wiktionary.constants";

/** Wiktionary Latin category keys, derived from `categories`. */
export type Category = keyof typeof categories;

/** Lemma bounds of a scrape. */
export interface WiktionaryCommandOptions {
  endLemma?: string;
  startLemma?: string;
}
