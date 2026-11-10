// 🏷️ Types

import type { CommandOptionValue } from "../lexico-ingestion/lexico-ingestion.types";

/**
 * Optional start and end lemmas bounding dictionary ingestion: a lemma, `true` for a bare flag, or absent for no bound.
 */
export interface DictionaryCommandOptions {
  endLemma?: CommandOptionValue;
  startLemma?: CommandOptionValue;
}
