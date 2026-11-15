import { LibraryTextKind } from "./library-filters.entities";
import { LibrarySortDirection } from "./library-sort.entities";
import {
  LIBRARY_BOOK_TYPE,
  LIBRARY_SORT_COLUMNS,
  LIBRARY_TEXT_SEARCH_COLUMNS,
} from "./library.constants";

import type {
  LibraryFilters,
  LibraryRange,
  LibrarySort,
} from "./library.types";

/** A SQL condition, and the named parameters its placeholders take. */
export interface LibrarySqlClause {
  readonly parameters: Record<string, unknown>;
  readonly sql: string;
}

/** The condition that keeps every row. */
const ALWAYS: LibrarySqlClause = { parameters: {}, sql: "TRUE" };

/** Joins clauses with AND. No clauses keep every row. */
export function andClauses(
  clauses: readonly LibrarySqlClause[],
): LibrarySqlClause {
  if (clauses.length === 0) {
    return ALWAYS;
  }
  return combine(clauses, "AND");
}

/** The filters on an author's own attributes. */
export function authorFilterClause(filters: LibraryFilters): LibrarySqlClause {
  const clauses: LibrarySqlClause[] = [];
  if (hasValues(filters.eras)) {
    clauses.push(sqlClause("author.era IN (:...eras)", { eras: filters.eras }));
  }
  clauses.push(
    ...overlapClauses(
      ["author.start_year", "author.end_year"],
      filters.authorYears,
      "authorYears",
    ),
  );
  return andClauses(clauses);
}

/** The SQL aggregate that picks an author's first Text under the sort. */
export function firstTextAggregate(
  direction: LibrarySortDirection,
): "MAX" | "MIN" {
  return direction === LibrarySortDirection.DESC ? "MAX" : "MIN";
}

/** Whether any filter narrows the Texts an author card carries. */
export function hasTextFilters(filters: LibraryFilters): boolean {
  return (
    hasValues(filters.collections) ||
    hasValues(filters.inscriptionTypes) ||
    hasValues(filters.kinds) ||
    hasValues(filters.materials) ||
    hasValues(filters.provinces) ||
    hasRange(filters.inscriptionYears) ||
    hasRange(filters.lineCount) ||
    hasRange(filters.printYears) ||
    hasRange(filters.wordCount)
  );
}

/** Matches an author by name or full name, on the `author` alias. */
export function matchAuthorClause(pattern: string): LibrarySqlClause {
  return sqlClause(
    "(LOWER(author.name) LIKE :pattern OR LOWER(author.full_name) LIKE :pattern)",
    { pattern },
  );
}

/** Matches a Text by any searchable column, on the given alias. */
export function matchTextClause(
  alias: string,
  pattern: string,
): LibrarySqlClause {
  const columns = [
    ...LIBRARY_TEXT_SEARCH_COLUMNS.map(
      (column) => `LOWER(${alias}.${column}) LIKE :pattern`,
    ),
    `LOWER(CAST(${alias}.collection AS TEXT)) LIKE :pattern`,
  ];
  return sqlClause(`(${columns.join(" OR ")})`, { pattern });
}

/** Joins clauses with OR. */
export function orClauses(
  clauses: readonly LibrarySqlClause[],
): LibrarySqlClause {
  return combine(clauses, "OR");
}

/** The SQL keyword for a sort direction. */
export function orderDirection(
  direction: LibrarySortDirection,
): "ASC" | "DESC" {
  return direction === LibrarySortDirection.DESC ? "DESC" : "ASC";
}

/** The sort's attribute as SQL, on the `author` or `text` alias. */
export function sortColumnSql(
  field: LibrarySort["field"],
  alias: string,
): string {
  return `${alias}.${LIBRARY_SORT_COLUMNS[field].column}`;
}

/** Makes a clause from SQL and the parameters it names. */
export function sqlClause(
  sql: string,
  parameters: Record<string, unknown> = {},
): LibrarySqlClause {
  return { parameters, sql };
}

/** The filters on a Text's attributes, on the given alias. */
export function textFilterClause(
  alias: string,
  filters: LibraryFilters,
): LibrarySqlClause {
  const clauses: LibrarySqlClause[] = [];
  if (hasValues(filters.collections)) {
    clauses.push(
      sqlClause(`${alias}.collection IN (:...collections)`, {
        collections: filters.collections,
      }),
    );
  }
  if (hasValues(filters.provinces)) {
    clauses.push(
      sqlClause(`${alias}.province IN (:...provinces)`, {
        provinces: filters.provinces,
      }),
    );
  }
  if (hasValues(filters.inscriptionTypes)) {
    clauses.push(
      sqlClause(`${alias}.inscription_type IN (:...inscriptionTypes)`, {
        inscriptionTypes: filters.inscriptionTypes,
      }),
    );
  }
  if (hasValues(filters.materials)) {
    clauses.push(
      sqlClause(`${alias}.material IN (:...materials)`, {
        materials: filters.materials,
      }),
    );
  }
  clauses.push(
    ...kindClauses(alias, filters.kinds),
    ...overlapClauses(
      [`${alias}.start_year`, `${alias}.end_year`],
      filters.inscriptionYears,
      "inscriptionYears",
    ),
    ...boundedClauses(`${alias}.print_year`, filters.printYears, "printYears"),
    ...boundedClauses(`${alias}.line_count`, filters.lineCount, "lineCount"),
    ...boundedClauses(`${alias}.word_count`, filters.wordCount, "wordCount"),
  );
  return andClauses(clauses);
}

/**
 * The order the Texts of a card take: by the sort when it names a Text
 * attribute, then by title. Nulls sort last in both directions.
 */
export function textOrderSql(sort: LibrarySort): string {
  const tieBreak = "text.title ASC, text.id ASC";
  if (LIBRARY_SORT_COLUMNS[sort.field].scope !== "text") {
    return tieBreak;
  }
  return `${sortColumnSql(sort.field, "text")} ${orderDirection(sort.direction)} NULLS LAST, ${tieBreak}`;
}

/**
 * The Texts a library request keeps: all of an author's Texts when the
 * author matched the search, otherwise the matching ones; and then only those
 * the text filters keep.
 */
export function textScopeClause(
  alias: string,
  pattern: null | string,
  filters: LibraryFilters,
): LibrarySqlClause {
  const search =
    pattern === null
      ? ALWAYS
      : orClauses([
          matchAuthorClause(pattern),
          matchTextClause(alias, pattern),
        ]);
  return andClauses([search, textFilterClause(alias, filters)]);
}

/** Keeps rows whose single value lies inside the range, inclusive. */
function boundedClauses(
  column: string,
  range: LibraryRange | null | undefined,
  key: string,
): LibrarySqlClause[] {
  const clauses: LibrarySqlClause[] = [];
  if (typeof range?.min === "number") {
    clauses.push(
      sqlClause(`${column} >= :${key}Min`, { [`${key}Min`]: range.min }),
    );
  }
  if (typeof range?.max === "number") {
    clauses.push(
      sqlClause(`${column} <= :${key}Max`, { [`${key}Max`]: range.max }),
    );
  }
  return clauses;
}

/** Joins clauses with one operator, merging their parameters. */
function combine(
  clauses: readonly LibrarySqlClause[],
  operator: "AND" | "OR",
): LibrarySqlClause {
  const parameters: Record<string, unknown> = {};
  for (const clause of clauses) {
    Object.assign(parameters, clause.parameters);
  }
  return {
    parameters,
    sql: `(${clauses.map((clause) => clause.sql).join(` ${operator} `)})`,
  };
}

/** Whether a range bounds its attribute on either side. */
function hasRange(range: LibraryRange | null | undefined): boolean {
  return typeof range?.min === "number" || typeof range?.max === "number";
}

/** Whether a list filter names any value. */
function hasValues(values: null | readonly unknown[] | undefined): boolean {
  return (values?.length ?? 0) > 0;
}

/** Keeps books, or other Texts; both together keep every Text. */
function kindClauses(
  alias: string,
  kinds: LibraryFilters["kinds"],
): LibrarySqlClause[] {
  const book = kinds?.includes(LibraryTextKind.BOOK) ?? false;
  const text = kinds?.includes(LibraryTextKind.TEXT) ?? false;
  if (book === text) {
    return [];
  }
  return [
    book
      ? sqlClause(`${alias}.type = :bookType`, { bookType: LIBRARY_BOOK_TYPE })
      : sqlClause(`${alias}.type <> :bookType`, {
          bookType: LIBRARY_BOOK_TYPE,
        }),
  ];
}

/**
 * Keeps rows whose [start, end] span overlaps the range. A row with no start
 * or no end is left out, because it cannot be placed on the range.
 */
function overlapClauses(
  [start, end]: readonly [string, string],
  range: LibraryRange | null | undefined,
  key: string,
): LibrarySqlClause[] {
  const clauses: LibrarySqlClause[] = [];
  if (typeof range?.min === "number") {
    clauses.push(
      sqlClause(`${end} >= :${key}Min`, { [`${key}Min`]: range.min }),
    );
  }
  if (typeof range?.max === "number") {
    clauses.push(
      sqlClause(`${start} <= :${key}Max`, { [`${key}Max`]: range.max }),
    );
  }
  return clauses;
}
