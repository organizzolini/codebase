import { createServerFn as createServerFunction } from "@tanstack/react-start";

import {
  getLibraryChildrenInputSchema,
  getLibraryWorksInputSchema,
} from "./library-text-tree-api.constants";
import {
  fetchLibraryChildren,
  fetchLibraryWorks,
} from "./library-text-tree.utilities";

import type { LibraryTextsPage } from "./library-text-tree.types";

// ♟️ Constants

/**
 * Reads one page of the Texts under a Text, for an expanded work.
 */
export const getLibraryChildren = createServerFunction({ method: "GET" })
  .validator(getLibraryChildrenInputSchema)
  .handler(async ({ data }): Promise<LibraryTextsPage> =>
    fetchLibraryChildren(data),
  );

/**
 * Reads one page of an author's top-level works, for a card's load more.
 */
export const getLibraryWorks = createServerFunction({ method: "GET" })
  .validator(getLibraryWorksInputSchema)
  .handler(async ({ data }): Promise<LibraryTextsPage> =>
    fetchLibraryWorks(data),
  );
