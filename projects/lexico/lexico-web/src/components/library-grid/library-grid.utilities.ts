import { LibraryDocument } from "../../graphql/generated/operations";
import { queryApi } from "../search-results/search.utilities";

import { LIBRARY_PAGE_SIZE } from "./library-grid-api.constants";

import type { GetLibraryInput, LibraryPageResult } from "./library-grid.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Asks the API for one page of the library and returns what it answers.
 */
export async function fetchLibrary(
  input: Readonly<GetLibraryInput>,
): Promise<LibraryPageResult> {
  const { library } = await queryApi(LibraryDocument, {
    page: input.page,
    pageSize: LIBRARY_PAGE_SIZE,
    search: input.search,
  });

  return library;
}
