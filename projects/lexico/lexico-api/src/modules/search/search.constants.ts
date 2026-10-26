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

/**
 * What each edit of distance takes off `SCORE_FUZZY`, so a closer fuzzy match
 * ranks higher and every fuzzy score stays below the prefix tier.
 */
export const SCORE_FUZZY_STEP = 0.1;

/**
 * Shortest search term fuzzy matching applies to, and the shortest one allowed
 * two edits instead of one.
 */
export const FUZZY_MINIMUM_LENGTH = 3;
export const FUZZY_TWO_EDIT_LENGTH = 6;

/**
 * The tier a Latin match's best score names. Every Latin tier scores
 * differently, so a lexeme's score alone says which tier ranked it highest.
 */
export const LATIN_TIER_SOURCES: ReadonlyMap<number, SearchMatchSource> =
  new Map([
    [SCORE_ENCLITIC, SearchMatchSource.ENCLITIC],
    [SCORE_LEMMA_EXACT, SearchMatchSource.LEMMA_EXACT],
    [SCORE_PREFIX, SearchMatchSource.PREFIX],
    [SCORE_WORD_EXACT, SearchMatchSource.WORD_EXACT],
  ]);

/**
 * The tier an English match's best score names, where any score below a
 * prefix match is a full-text one.
 */
export const ENGLISH_TIER_SOURCES: ReadonlyMap<number, SearchMatchSource> =
  new Map([
    [SCORE_TRANSLATION_EXACT, SearchMatchSource.TRANSLATION_EXACT],
    [SCORE_TRANSLATION_PREFIX, SearchMatchSource.TRANSLATION_PREFIX],
  ]);

/**
 * Most lexemes a prefix headword match or fuzzy match ranks per search term,
 * the first by id, before translations are checked.
 */
export const LATIN_TIER_RESULT_LIMIT = 50;

/**
 * Ranks one matched translation for an English search, given the `exactQuery`
 * and `prefixQuery` parameters: an exact translation outranks one the query
 * starts, which outranks any other substring or full-text match.
 */
export const ENGLISH_MATCH_SCORE_EXPRESSION = `CASE WHEN LOWER(translation.data) = :exactQuery THEN ${SCORE_TRANSLATION_EXACT} WHEN translation.data ILIKE :prefixQuery THEN ${SCORE_TRANSLATION_PREFIX} ELSE ${SCORE_TRANSLATION_FULLTEXT} END`;

/**
 * Most lexemes an English search ranks before paginating. A common word such
 * as "to" matches a large share of all translations, so the database ranks and
 * caps the matches instead of loading every one of them into memory.
 */
export const ENGLISH_SEARCH_RESULT_LIMIT = 200;
