// ♟️ Constants

import { HISTORICAL_CORPUS_1 } from "./historical-corpus-1.constants";
import { HISTORICAL_CORPUS_2 } from "./historical-corpus-2.constants";
import { HISTORICAL_CORPUS_3 } from "./historical-corpus-3.constants";
import { HISTORICAL_CORPUS_4 } from "./historical-corpus-4.constants";
import { HISTORICAL_CORPUS_5 } from "./historical-corpus-5.constants";
import { HISTORICAL_CORPUS_6 } from "./historical-corpus-6.constants";
import { HISTORICAL_CORPUS_7 } from "./historical-corpus-7.constants";
import { HISTORICAL_CORPUS_8 } from "./historical-corpus-8.constants";
import { HISTORICAL_CORPUS_9 } from "./historical-corpus-9.constants";
import { HISTORICAL_CORPUS_10 } from "./historical-corpus-10.constants";
import { HISTORICAL_CORPUS_11 } from "./historical-corpus-11.constants";

import type { CorpusEntry } from "./corpus.types";

/**
 * Every drawing the repository used to commit, collapsed to one entry per Code.
 * `CorpusService.ingest` keeps only the entries beyond the enumeration's reach.
 */
export const HISTORICAL_CORPUS: readonly CorpusEntry[] = [
  ...HISTORICAL_CORPUS_1,
  ...HISTORICAL_CORPUS_2,
  ...HISTORICAL_CORPUS_3,
  ...HISTORICAL_CORPUS_4,
  ...HISTORICAL_CORPUS_5,
  ...HISTORICAL_CORPUS_6,
  ...HISTORICAL_CORPUS_7,
  ...HISTORICAL_CORPUS_8,
  ...HISTORICAL_CORPUS_9,
  ...HISTORICAL_CORPUS_10,
  ...HISTORICAL_CORPUS_11,
];
