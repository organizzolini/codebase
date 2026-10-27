import {
  Equal,
  Landmark,
  Languages,
  ListStart,
  ScanSearch,
  TextSearch,
} from "lucide-react";

import type { LexemeMatchKind } from "./lexeme-match.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

/**
 * The language of the word a search matched, as an icon and what it says.
 */
export const LANGUAGES: Readonly<
  Record<"english" | "latin", { hint: string; icon: LucideIcon; label: string }>
> = {
  english: {
    hint: "Matched an English translation",
    icon: Languages,
    label: "English match",
  },
  latin: {
    hint: "Matched a Latin word",
    icon: Landmark,
    label: "Latin match",
  },
};

/**
 * How closely the word matched what was searched, as an icon and what it says.
 */
export const TYPES: Readonly<
  Record<
    "contains" | "exact" | "fuzzy" | "starts-with",
    { icon: LucideIcon; label: string }
  >
> = {
  contains: { icon: TextSearch, label: "Contains" },
  exact: { icon: Equal, label: "Exact match" },
  fuzzy: { icon: ScanSearch, label: "Fuzzy match" },
  "starts-with": { icon: ListStart, label: "Starts with" },
};

/**
 * Which language and how close each way a search can match a lexeme is, and a
 * few words explaining it.
 */
export const KINDS: Readonly<
  Record<
    LexemeMatchKind,
    {
      hint: string;
      language: "english" | "latin";
      type: "contains" | "exact" | "fuzzy" | "starts-with";
    }
  >
> = {
  contains: {
    hint: "A translation mentions what you searched for",
    language: "english",
    type: "contains",
  },
  enclitic: {
    hint: "A form of this word with an enclitic, such as -que, attached",
    language: "latin",
    type: "exact",
  },
  "exact-form": {
    hint: "An inflected form of this word",
    language: "latin",
    type: "exact",
  },
  "exact-headword": {
    hint: "The headword is exactly what you searched for",
    language: "latin",
    type: "exact",
  },
  fuzzy: {
    hint: "A headword or form a few letters away from what you searched for",
    language: "latin",
    type: "fuzzy",
  },
  prefix: {
    hint: "The headword starts with what you searched for",
    language: "latin",
    type: "starts-with",
  },
  "translation-exact": {
    hint: "A translation is exactly what you searched for",
    language: "english",
    type: "exact",
  },
  "translation-prefix": {
    hint: "A translation starts with what you searched for",
    language: "english",
    type: "starts-with",
  },
};
