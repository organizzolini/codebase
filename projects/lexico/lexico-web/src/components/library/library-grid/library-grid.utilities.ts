import { LibraryDocument } from "../../../graphql/generated/operations";
import { queryApi } from "../../search/search-results/search.utilities";

import { LIBRARY_PAGE_SIZE } from "./library-grid-api.constants";

import type {
  LibraryFilters,
  LibraryRange,
  LibrarySort,
} from "../../../graphql/generated/operations";
import type { GetLibraryInput, LibraryPageResult } from "./library-grid.types";

// 🔏 Private Functions

/**
 * Asks the API for one page of the library and returns what it answers.
 */
export async function fetchLibrary(
  input: Readonly<GetLibraryInput>,
): Promise<LibraryPageResult> {
  const { library } = await queryApi(LibraryDocument, {
    filters: toFilters(input),
    page: input.page,
    pageSize: input.limit ?? LIBRARY_PAGE_SIZE,
    search: input.search,
    sort: toSort(input),
  });

  return library;
}

/** The filters the URL names, as the API reads them. */
export function toFilters(input: Readonly<GetLibraryInput>): LibraryFilters {
  return {
    authorYears: toRange(input.authorYearsMinimum, input.authorYearsMaximum),
    eras: orNull(input.eras),
    inscriptionTypes: orNull(input.inscriptionTypes),
    inscriptionYears: toRange(
      input.inscriptionYearsMinimum,
      input.inscriptionYearsMaximum,
    ),
    lineCount: toRange(input.lineCountMinimum, input.lineCountMaximum),
    materials: orNull(input.materials),
    printYears: toRange(input.printYearsMinimum, input.printYearsMaximum),
    provinces: orNull(input.provinces),
    wordCount: toRange(input.wordCountMinimum, input.wordCountMaximum),
  };
}

/** The sort the URL names, or null for the API's default order. */
export function toSort(input: Readonly<GetLibraryInput>): LibrarySort | null {
  return input.sort === undefined
    ? null
    : { direction: orNull(input.direction), field: input.sort };
}

// 🌎 Public Functions

/** Null for an unset filter, which is how the API reads "no filter". */
function orNull<T>(value: T | undefined): null | T {
  return value ?? null;
}

/** A range with at least one bound, or null when the filter is not set. */
function toRange(
  minimum: number | undefined,
  maximum: number | undefined,
): LibraryRange | null {
  return minimum === undefined && maximum === undefined
    ? null
    : { max: maximum ?? null, min: minimum ?? null };
}
