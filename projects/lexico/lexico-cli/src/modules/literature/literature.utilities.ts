import _ from "lodash";

import {
  authorMetadataSchema,
  textFrontmatterSchema,
} from "./literature.constants";

import type { AuthorAttributes, TextAttributes } from "./literature.types";
import type { Author, Token } from "@codebase/lexico-db";
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
  const valid: Record<string, unknown> = {};
  const invalidFields: string[] = [];
  for (const [field, schema] of Object.entries(textFrontmatterSchema.shape)) {
    const value = frontmatter[field];
    if (value === undefined) continue;
    const parsed = schema.safeParse(value);
    if (parsed.success) valid[field] = parsed.data;
    else invalidFields.push(field);
  }
  const { print_year, work_identifier, ...rest } = valid;
  const attributes = _.omitBy(
    { ...rest, printYear: print_year, workIdentifier: work_identifier },
    (value) => value === undefined,
  );
  return { attributes, invalidFields };
}
