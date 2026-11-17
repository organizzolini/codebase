// cspell:ignore Carmina
import {
  LibraryChildrenDocument,
  LibraryWorksDocument,
} from "../../graphql/generated/operations";
import { toFilters, toSort } from "../library-grid/library-grid.utilities";
import { queryApi } from "../search-results/search.utilities";

import {
  LIBRARY_CHILDREN_PAGE_SIZE,
  LIBRARY_RANGE_SIZE,
  LIBRARY_WORKS_PAGE_SIZE,
} from "./library-text-tree-api.constants";

import type { LibraryTextRow } from "../library-grid/library-grid.types";
import type {
  GetLibraryChildrenInput,
  GetLibraryWorksInput,
  LibraryNumbered,
  LibraryNumberGroup,
  LibraryTextLevel,
  LibraryTextsPage,
} from "./library-text-tree.types";

// 🔏 Private Functions

/** Asks the API for one page of the Texts under a Text. */
export async function fetchLibraryChildren(
  input: Readonly<GetLibraryChildrenInput>,
): Promise<LibraryTextsPage> {
  const { libraryChildren } = await queryApi(LibraryChildrenDocument, {
    page: input.page,
    pageSize: LIBRARY_CHILDREN_PAGE_SIZE,
    parentTextId: input.parentTextId,
    search: input.search,
  });
  return libraryChildren;
}

/** Asks the API for one page of an author's top-level works under the library's filters. */
export async function fetchLibraryWorks(
  input: Readonly<GetLibraryWorksInput>,
): Promise<LibraryTextsPage> {
  const { libraryWorks } = await queryApi(LibraryWorksDocument, {
    authorId: input.authorId,
    filters: toFilters(input),
    page: input.page,
    pageSize: LIBRARY_WORKS_PAGE_SIZE,
    search: input.search,
    sort: toSort(input),
  });
  return libraryWorks;
}

/** Appends the rows a page brought, leaving out any the level already holds. */
export function mergeRows(
  current: readonly LibraryTextRow[],
  loaded: readonly LibraryTextRow[],
): LibraryTextRow[] {
  const known = new Set(current.map(({ text }) => text.id));
  return [...current, ...loaded.filter(({ text }) => !known.has(text.id))];
}

/**
 * Reads a title that ends in a number or a two-number range. Titles with a
 * longer run of numbers, or a Roman numeral and nothing else, are not numbered.
 */
export function numberedOf(row: LibraryTextRow): LibraryNumbered | null {
  const tokens = row.text.title
    .replaceAll(/\s*[-–—]\s*/gu, " ")
    .trim()
    .split(/\s+/u);
  const values = trailingNumerals(tokens);
  const first = values[0];
  const last = values.at(-1);
  const prefix = tokens.slice(0, tokens.length - values.length);
  const isArabic = /\d/u.test(tokens.at(-1) ?? "");
  if (
    first === undefined ||
    last === undefined ||
    values.length > 2 ||
    (prefix.length === 0 && !isArabic)
  ) {
    return null;
  }
  return {
    first,
    label: first === last ? String(first) : `${String(first)}–${String(last)}`,
    last,
    prefix: prefix.join(" "),
    row,
  };
}

// 🌎 Public Functions

/**
 * Splits a level of Texts into rows and groups of numbered buttons. Numbered
 * leaves in numeric order form one group, or ranges of at most
 * {@link LIBRARY_RANGE_SIZE} when there are more; a lone number stays a row.
 */
export function splitLevel(
  rows: readonly LibraryTextRow[],
  depth: number,
): LibraryTextLevel {
  const numbered: LibraryNumbered[] = [];
  const others: LibraryTextRow[] = [];
  for (const row of rows) {
    const item = depth > 0 && row.childCount === 0 ? numberedOf(row) : null;
    if (item === null) {
      others.push(row);
    } else {
      numbered.push(item);
    }
  }
  if (numbered.length < 2) {
    return { groups: [], rows: [...rows] };
  }

  numbered.sort((a, b) => a.first - b.first || a.last - b.last);
  const groups: LibraryNumberGroup[] = [];
  for (let start = 0; start < numbered.length; start += LIBRARY_RANGE_SIZE) {
    const items = numbered.slice(start, start + LIBRARY_RANGE_SIZE);
    groups.push({
      items,
      label: rangeLabel(items, numbered.length > LIBRARY_RANGE_SIZE),
    });
  }
  return { groups, rows: others };
}

/**
 * The value of one numeral token. Arabic digits count; a Roman numeral counts
 * only as the title case a title carries it in, such as "Xxii", or in capitals.
 */
function numeralValue(token: string): null | number {
  if (/^\d{1,6}$/u.test(token)) {
    return Number(token);
  }
  const capitals = token.toUpperCase();
  const titleCase = `${capitals.slice(0, 1)}${token.slice(1).toLowerCase()}`;
  return token === capitals || token === titleCase
    ? romanValue(capitals)
    : null;
}

/** The label of a group of numbered Texts: "Carmina 21–40", or "" when the group is the whole level. */
function rangeLabel(
  items: readonly LibraryNumbered[],
  isSplit: boolean,
): string {
  const first = items[0];
  const last = items.at(-1);
  if (!isSplit || first === undefined || last === undefined) {
    return "";
  }
  const prefix = items.every((item) => item.prefix === first.prefix)
    ? `${first.prefix} `
    : "";
  return `${prefix}${String(first.first)}–${String(last.last)}`;
}

/** The value of a Roman numeral written in capitals, or null when it is not one. */
function romanValue(token: string): null | number {
  if (
    !/^M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/u.test(
      token,
    )
  ) {
    return null;
  }
  const values: Record<string, number> = {
    C: 100,
    D: 500,
    I: 1,
    L: 50,
    M: 1000,
    V: 5,
    X: 10,
  };
  let total = 0;
  for (let index = 0; index < token.length; index += 1) {
    const value = values[token.charAt(index)] ?? 0;
    const next = values[token.charAt(index + 1)] ?? 0;
    total += value < next ? -value : value;
  }
  return total === 0 ? null : total;
}

/** The values of the numeral tokens that end a title, in reading order. */
function trailingNumerals(tokens: readonly string[]): number[] {
  const values: number[] = [];
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const value = numeralValue(tokens[index] ?? "");
    if (value === null) {
      break;
    }
    values.unshift(value);
  }
  return values;
}
