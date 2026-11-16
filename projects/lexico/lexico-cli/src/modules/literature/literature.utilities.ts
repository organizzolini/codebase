import _ from "lodash";
import { Raw } from "typeorm";

import {
  authorMetadataSchema,
  EDCS_PROVIDER,
  ERA_BOUNDARIES,
  textFrontmatterSchema,
  WIKIDATA_MAXIMUM_BACKOFF_MILLISECONDS,
  WIKIDATA_REQUEST_DELAY_MILLISECONDS,
} from "./literature.constants";

import type {
  AuthorAttributes,
  AuthorYears,
  LibraryEntry,
  TextAttributes,
  WikidataField,
} from "./literature.types";
import type { Author, AuthorEra, Text, Token } from "@codebase/lexico-db";
import type { Repository } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

/**
 * Waits as long as Wikidata's Retry-After header asks, else doubles the request delay for each
 * try, never longer than the cap.
 */
export function backoffMilliseconds(
  retryAfter: null | string,
  attempt: number,
): number {
  const asked = Number(retryAfter) * 1000;
  const wait =
    retryAfter !== null && asked >= 0
      ? asked
      : WIKIDATA_REQUEST_DELAY_MILLISECONDS * 2 ** (attempt - 1);
  return Math.min(wait, WIKIDATA_MAXIMUM_BACKOFF_MILLISECONDS);
}

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
 * Maps a text's frontmatter source fields onto its typed columns, field by field, and names
 * the fields that were present but invalid so one bad field never drops the rest.
 */
export function parseText(frontmatter: Record<string, unknown>): {
  attributes: TextAttributes;
  invalidFields: string[];
} {
  const attributes: Record<string, unknown> = {};
  const invalidFields: string[] = [];
  for (const [field, schema] of Object.entries(textFrontmatterSchema.shape)) {
    const value = frontmatter[field];
    if (value === undefined) continue;
    const parsed = schema.safeParse(value);
    if (parsed.success) attributes[_.camelCase(field)] = parsed.data;
    else invalidFields.push(field);
  }
  return { attributes, invalidFields };
}

/**
 * Takes an author's earliest birth and death from the Wikidata rows, or the earliest floruit
 * when they are missing or contradict each other; nothing if neither is usable. The ticket
 * names no other fallback, so a lone birth or death is ignored.
 */
export function pickWikidataYears(
  rows: Partial<Record<WikidataField, undefined | { value: string }>>[],
): AuthorYears | undefined {
  const birth = earliestYear(rows, "birth");
  const death = earliestYear(rows, "death");
  if (birth !== undefined && death !== undefined && birth <= death)
    return { endYear: death, startYear: birth };
  const floruit = earliestYear(rows, "floruit");
  return floruit === undefined
    ? undefined
    : { endYear: floruit, startYear: floruit };
}

/**
 * Soft-deletes the numbered "Part" texts an earlier EDCS run stored per province, which the
 * per-inscription texts replace; only an author with EDCS entries is touched.
 */
export async function removeReplacedTexts(
  repository: Repository<Text>,
  authorId: string,
  entries: LibraryEntry[],
): Promise<number> {
  if (!entries.some((entry) => entry.provider === EDCS_PROVIDER)) return 0;
  const replaced = await repository.find({
    select: { id: true },
    where: {
      author: { id: authorId },
      title: Raw((alias) => `${alias} ~ ' Part [0-9]+$'`),
      type: "text",
    },
  });
  if (replaced.length === 0) return 0;
  await repository.softDelete(replaced.map((text) => text.id));
  return replaced.length;
}

/** The earliest usable year among a field's values in every row. */
function earliestYear(
  rows: Partial<Record<WikidataField, undefined | { value: string }>>[],
  field: "birth" | "death" | "floruit",
): number | undefined {
  const years = rows
    .map((row) =>
      parseWikidataYear(row[field]?.value, row[`${field}Precision`]?.value),
    )
    .filter((year) => year !== undefined);
  return years.length > 0 ? Math.min(...years) : undefined;
}

/**
 * Reads a Wikidata date as a year, negative for BCE; its calendar has a year 0. A date coarser
 * than a year names none. Wikidata gives a 1 to 3 January date as 31 December of the year
 * before once converted, as Cicero's birth shows, so 31 December counts toward the next year.
 */
function parseWikidataYear(
  value: string | undefined,
  precision: string | undefined,
): number | undefined {
  const match = value ? /^(-?\d+)-(\d{2})-(\d{2})/.exec(value) : null;
  if (!match || (precision !== undefined && Number(precision) < 9))
    return undefined;
  const isYearEnd = match[2] === "12" && match[3] === "31";
  const year = Number(match[1]) + (isYearEnd ? 1 : 0);
  return year <= 0 ? year - 1 : year;
}
