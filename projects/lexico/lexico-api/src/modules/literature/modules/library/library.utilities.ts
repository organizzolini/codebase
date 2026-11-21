import { GraphQLError } from "graphql";

import { toAuthorType, toTextType } from "../../literature.utilities";

import { LibraryAuthorType } from "./library-author.entities";
import { LibraryMatchType } from "./library-match.entities";
import { LibraryPageType } from "./library-page.entities";
import { LibraryTextType } from "./library-text.entities";
import { LibraryTextsPageType } from "./library-texts-page.entities";
import {
  LIBRARY_CHILDREN_PAGE_SIZE,
  LIBRARY_DEFAULT_PAGE_SIZE,
  LIBRARY_DEFAULT_SORT,
  libraryArgumentsSchema,
  libraryChildrenArgumentsSchema,
} from "./library.constants";

import type { LibraryArguments } from "./library-arguments.entities";
import type { LibraryChildrenArguments } from "./library-children-arguments.entities";
import type {
  LibraryAuthorRecord,
  LibraryMatchRange,
  LibraryPageRecord,
  LibraryTextRecord,
  LibraryTextsPageRecord,
  ParsedLibraryArguments,
  ParsedLibraryChildrenArguments,
} from "./library.types";
import type { ZodError } from "zod";

/**
 * Escapes a search term for a LIKE pattern, so that `%` and `_` match
 * themselves and only the wildcards the query adds match anything.
 */
export function escapeLikePattern(term: string): string {
  return term.replaceAll(/[\\%_]/g, (character) => `\\${character}`);
}

/**
 * Finds every non-overlapping, case-insensitive occurrence of a term in a
 * field's value. Offsets index the original value, never a lowercased copy,
 * because lowercasing can change a string's length (`İ` becomes two units).
 */
export function findMatchRanges(
  field: string,
  value: null | string | undefined,
  term: null | string,
): LibraryMatchRange[] {
  if (term === null || term.length === 0 || !value) {
    return [];
  }
  const pattern = new RegExp(
    term.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`),
    "giu",
  );
  return [...value.matchAll(pattern)].map((match) => ({
    end: match.index + match[0].length,
    field,
    start: match.index,
  }));
}

/** Computes the match ranges of every named field against a lowercased term. */
export function matchRangesOf(
  fields: Record<string, null | string | undefined>,
  term: null | string,
): LibraryMatchRange[] {
  return Object.entries(fields).flatMap(([field, value]) =>
    findMatchRanges(field, value, term),
  );
}

/**
 * Validates library arguments at the resolver boundary. Invalid input is
 * reported to the client as a bad user input error.
 */
export function parseLibraryArguments(
  arguments_: LibraryArguments,
): ParsedLibraryArguments {
  const result = libraryArgumentsSchema.safeParse(arguments_);
  if (!result.success) {
    throw badInput(result.error);
  }
  return {
    filters: result.data.filters ?? {},
    page: result.data.page ?? 1,
    pageSize: result.data.pageSize ?? LIBRARY_DEFAULT_PAGE_SIZE,
    search: normalizeSearch(result.data.search),
    sort: {
      direction: result.data.sort?.direction ?? LIBRARY_DEFAULT_SORT.direction,
      field: result.data.sort?.field ?? LIBRARY_DEFAULT_SORT.field,
    },
  };
}

/**
 * Validates children arguments at the resolver boundary, like
 * {@link parseLibraryArguments}.
 */
export function parseLibraryChildrenArguments(
  arguments_: LibraryChildrenArguments,
): ParsedLibraryChildrenArguments {
  const result = libraryChildrenArgumentsSchema.safeParse(arguments_);
  if (!result.success) {
    throw badInput(result.error);
  }
  return {
    page: result.data.page ?? 1,
    pageSize: result.data.pageSize ?? LIBRARY_CHILDREN_PAGE_SIZE,
    parentTextId: result.data.parentTextId,
    search: normalizeSearch(result.data.search),
  };
}

/**
 * The lowercased term a search matches, and the LIKE pattern that matches it.
 * Both are null when there is no search.
 */
export function searchPatternsOf(search: null | string): {
  readonly pattern: null | string;
  readonly term: null | string;
} {
  const term = search?.toLowerCase() ?? null;
  return {
    pattern: term === null ? null : `%${escapeLikePattern(term)}%`,
    term,
  };
}

/** Maps a library page to its GraphQL type. */
export function toLibraryPageType(page: LibraryPageRecord): LibraryPageType {
  return Object.assign(new LibraryPageType(), {
    authors: page.authors.map((author) => toLibraryAuthorType(author)),
    pageCount: page.pageCount,
    totalCount: page.totalCount,
  });
}

/** Maps a page of Texts to its GraphQL type. */
export function toLibraryTextsPageType(
  page: LibraryTextsPageRecord,
): LibraryTextsPageType {
  return Object.assign(new LibraryTextsPageType(), {
    pageCount: page.pageCount,
    texts: page.texts.map((text) => toLibraryTextType(text)),
    totalCount: page.totalCount,
  });
}

/** The bad-user-input error that reports every problem in some arguments. */
function badInput(error: ZodError): GraphQLError {
  return new GraphQLError(
    error.issues.map((issue) => issue.message).join("; "),
    { extensions: { code: "BAD_USER_INPUT" } },
  );
}

/** Trims a search, and reads a blank one as no search. */
function normalizeSearch(search: null | string | undefined): null | string {
  const trimmed = search?.trim() ?? "";
  return trimmed.length === 0 ? null : trimmed;
}

/** Maps an author card to its GraphQL type. */
function toLibraryAuthorType(record: LibraryAuthorRecord): LibraryAuthorType {
  return Object.assign(new LibraryAuthorType(), {
    author: toAuthorType(record.author),
    matches: record.matches.map((range) => toMatchType(range)),
    workCount: record.workCount,
    works: record.works.map((text) => toLibraryTextType(text)),
  });
}

/** Maps a Text on an author card to its GraphQL type. */
function toLibraryTextType(record: LibraryTextRecord): LibraryTextType {
  return Object.assign(new LibraryTextType(), {
    childCount: record.childCount,
    matches: record.matches.map((range) => toMatchType(range)),
    text: toTextType(record.text),
  });
}

/** Maps a match range to its GraphQL type. */
function toMatchType(range: LibraryMatchRange): LibraryMatchType {
  return Object.assign(new LibraryMatchType(), {
    end: range.end,
    field: range.field,
    start: range.start,
  });
}
