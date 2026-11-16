import _ from "lodash";

import {
  authorMetadataSchema,
  ERA_BOUNDARIES,
  textFrontmatterSchema,
} from "./literature.constants";

import type {
  AuthorAttributes,
  AuthorYears,
  TextAttributes,
} from "./literature.types";
import type { Author, AuthorEra, Token } from "@codebase/lexico-db";
import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

/**
 * Counts a text's lines, words, and the words linked to a dictionary Word.
 */
export function countTokens(
  tokens: QueryDeepPartialEntity<Token>[],
  lineCount: number,
): { lineCount: number; recognisedWordCount: number; wordCount: number } {
  return {
    lineCount,
    recognisedWordCount: tokens.filter((token) => token.word).length,
    wordCount: tokens.filter((token) => !token.isPunctuation).length,
  };
}

/**
 * Places an author in the era their years' midpoint falls in; no years, no era.
 */
export function deriveEra(
  startYear?: null | number,
  endYear?: null | number,
): AuthorEra | undefined {
  const years = [startYear, endYear].filter((year) => typeof year === "number");
  if (years.length === 0) return undefined;
  const midpoint = _.mean(years);
  return ERA_BOUNDARIES.findLast((boundary) => midpoint >= boundary.from)?.era;
}

/**
 * Splits author metadata into typed columns and merges the rest into the author's metadata.
 */
export function mergeAuthor(
  author: Pick<Author, "metadata">,
  metadata: Record<string, unknown>,
): AuthorAttributes & { metadata: Record<string, unknown> } {
  const parsed = authorMetadataSchema.safeParse(metadata);
  const attributes = parsed.success
    ? _.omitBy(
        {
          endYear: parsed.data.death_year,
          fullName: parsed.data.full_name,
          startYear: parsed.data.birth_year,
        },
        (value) => value === undefined,
      )
    : {};
  const remaining = _.omit(metadata, ["birth_year", "death_year", "full_name"]);
  return { ...attributes, metadata: _.merge({}, author.metadata, remaining) };
}

/**
 * Maps a text's frontmatter source fields onto its typed columns; invalid input yields none.
 */
export function parseText(
  frontmatter: Record<string, unknown>,
): TextAttributes {
  const parsed = textFrontmatterSchema.safeParse(frontmatter);
  if (!parsed.success) return {};
  const {
    end_year,
    find_spot,
    inscription_type,
    print_year,
    start_year,
    work_identifier,
    ...rest
  } = parsed.data;
  return _.omitBy(
    {
      ...rest,
      endYear: end_year,
      findSpot: find_spot,
      inscriptionType: inscription_type,
      printYear: print_year,
      startYear: start_year,
      workIdentifier: work_identifier,
    },
    (value) => value === undefined,
  );
}

/**
 * Takes an author's birth and death from a Wikidata row, or its floruit when
 * they are missing or contradict each other; nothing if neither is usable.
 */
export function pickWikidataYears(
  row: Partial<
    Record<"birth" | "death" | "floruit", undefined | { value: string }>
  >,
): AuthorYears | undefined {
  const birth = parseWikidataYear(row.birth?.value);
  const death = parseWikidataYear(row.death?.value);
  if (birth !== undefined && death !== undefined && birth <= death)
    return { endYear: death, startYear: birth };
  const floruit = parseWikidataYear(row.floruit?.value);
  // shortcut: a birth or death alone is ignored, upgrade if authors lose their dates to it
  return floruit === undefined
    ? undefined
    : { endYear: floruit, startYear: floruit };
}

/**
 * Reads a Wikidata date as a year, negative for BCE; its calendar has a year 0.
 */
function parseWikidataYear(value: string | undefined): number | undefined {
  const year = value ? /^(-?\d+)-/.exec(value)?.[1] : undefined;
  if (year === undefined) return undefined;
  return Number(year) <= 0 ? Number(year) - 1 : Number(year);
}
