import type { WordCandidatesQuery } from "../../graphql/generated/operations";
import type { ReaderLineNode } from "../reader-lines/reader-lines.types";

// 🏷️ Types

/** One reading a clicked word can take, as the word-card lookup answers it. */
export type WordCandidate = WordCandidatesQuery["wordCandidates"][number];

/** What a finished lookup tells the history: a form and a short definition. */
export interface WordCardLookup {
  definition: null | string;
  form: string;
}

/** One candidate with its position and a unique list key. */
export interface WordCardReading {
  candidate: WordCandidate;
  key: string;
  position: number;
}

/** A status line the card shows in place of readings. */
export interface WordCardStatus {
  isError: boolean;
  text: string;
}

/** A word token as a reader line carries it. */
export type WordCardToken = ReaderLineNode["tokens"]["edges"][number]["node"];
