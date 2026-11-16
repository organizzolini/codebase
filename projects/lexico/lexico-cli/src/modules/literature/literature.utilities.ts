import _ from "lodash";
import { Raw } from "typeorm";

import {
  authorMetadataSchema,
  EDCS_PROVIDER,
  textFrontmatterSchema,
} from "./literature.constants";

import type {
  AuthorAttributes,
  LibraryEntry,
  TextAttributes,
} from "./literature.types";
import type { Author, Text, Token } from "@codebase/lexico-db";
import type { Repository } from "typeorm";
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
