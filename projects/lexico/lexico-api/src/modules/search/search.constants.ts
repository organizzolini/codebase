// ♟️ Constants

import { SearchMatchSource } from "./search.entities";

/* cspell:words ILIKE absque atque cumque denique FULLTEXT itaque neque neve paene pleraque plerique plerumque quaeque qualiscumque quandocumque quantuscumque quicque quidque quilibet quinque quisque quivis quodque quoque sive ubique undique unusquisque uterque utrimque */

/**
 * Known Latin enclitic suffixes.
 */
export const ENCLITIC_SUFFIXES = ["que", "ve", "ne"] as const;

/**
 * Common Latin words ending in enclitic-like suffixes that should not be decomposed.
 */
export const ENCLITIC_FALSE_POSITIVES = new Set([
  "absque",
  "atque",
  "bene",
  "cumque",
  "denique",
  "itaque",
  "neque",
  "neve",
  "paene",
  "pleraque",
  "plerique",
  "plerumque",
  "quaeque",
  "qualiscumque",
  "quandocumque",
  "quantuscumque",
  "quicque",
  "quidque",
  "quilibet",
  "quinque",
  "quisque",
  "quivis",
  "quodque",
  "quoque",
  "sive",
  "ubique",
  "undique",
  "unusquisque",
  "uterque",
  "utrimque",
]);

/**
 * Base relevance score constants for search result tiers.
 */
export const SCORE_LEMMA_EXACT = 1;
export const SCORE_WORD_EXACT = 0.9;
export const SCORE_ENCLITIC = 0.8;
export const SCORE_PREFIX = 0.7;
export const SCORE_TRANSLATION_EXACT = 1;
export const SCORE_TRANSLATION_PREFIX = 0.8;
export const SCORE_TRANSLATION_FULLTEXT = 0.6;
export const SCORE_FUZZY = 0.4;

/** Score lost per edit from `SCORE_FUZZY`, keeping fuzzy below prefix. */
export const SCORE_FUZZY_STEP = 0.1;

/** Shortest fuzzy term, and the length allowing two edits. */
export const FUZZY_MINIMUM_LENGTH = 3;
export const FUZZY_TWO_EDIT_LENGTH = 6;

/** The tier a Latin match's score names; tiers score distinctly. */
export const LATIN_TIER_SOURCES: ReadonlyMap<number, SearchMatchSource> =
  new Map([
    [SCORE_ENCLITIC, SearchMatchSource.ENCLITIC],
    [SCORE_LEMMA_EXACT, SearchMatchSource.LEMMA_EXACT],
    [SCORE_PREFIX, SearchMatchSource.PREFIX],
    [SCORE_WORD_EXACT, SearchMatchSource.WORD_EXACT],
  ]);

/** The tier an English score names; below prefix means full-text. */
export const ENGLISH_TIER_SOURCES: ReadonlyMap<number, SearchMatchSource> =
  new Map([
    [SCORE_TRANSLATION_EXACT, SearchMatchSource.TRANSLATION_EXACT],
    [SCORE_TRANSLATION_PREFIX, SearchMatchSource.TRANSLATION_PREFIX],
  ]);

/** Most headword prefix or fuzzy lexemes ranked per search term. */
export const LATIN_TIER_RESULT_LIMIT = 50;

/** Ranks a translation match: exact, then prefix, then any other. */
export const ENGLISH_MATCH_SCORE_EXPRESSION = `CASE WHEN LOWER(translation.data) = :exactQuery THEN ${SCORE_TRANSLATION_EXACT} WHEN translation.data ILIKE :prefixQuery THEN ${SCORE_TRANSLATION_PREFIX} ELSE ${SCORE_TRANSLATION_FULLTEXT} END`;

/** Lexeme cap for English search, so common words stay cheap. */
export const ENGLISH_SEARCH_RESULT_LIMIT = 200;
