// 🏷️ Types

import type { CommandOptionValue } from "../lexico-ingestion/lexico-ingestion.types";

/** Lemma bound: a value, `true` for a bare flag, or absent. */
export interface DictionaryCommandOptions {
  endLemma?: CommandOptionValue;
  startLemma?: CommandOptionValue;
}
