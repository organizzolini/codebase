import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

import { LibraryGrid } from "../components/library-grid/library-grid";
import {
  LIBRARY_PAGE_SIZE,
  librarySearchSchema,
} from "../components/library-grid/library-grid-api.constants";
import { getLibrary } from "../components/library-grid/library-grid.constants";
import { LibraryNoResults } from "../components/library-no-results/library-no-results";
import { LibraryPagination } from "../components/library-pagination/library-pagination";
import { isPastEnd } from "../components/library-pagination/library-pagination.utilities";
import { LibraryPastEnd } from "../components/library-past-end/library-past-end";
import { LibraryToolbar } from "../components/library-toolbar/library-toolbar";
import { getLibraryFacets } from "../components/library-toolbar/library-toolbar-api.constants";

import type {
  GetLibraryInput,
  LibraryFilterParameters,
  LibrarySearchParameters,
} from "../components/library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🧭 Route

/** Browses the library's authors, their books, and their texts, searched and paged from the URL. */
export const Route = createFileRoute("/library")({
  component: LibraryPage,
  head: ({ match }) => {
    const { search } = match.search;
    const named = search === undefined || search === "" ? "" : `: ${search}`;

    return {
      meta: [
        { title: `Lexico - Library${named}` },
        {
          content: `Browse Latin authors, their books and texts${search === undefined || search === "" ? "" : ` matching ${search}`}, with their era, dates, and collections`,
          name: "description",
        },
      ],
    };
  },
  loader: async ({ deps }: { deps: GetLibraryInput }) => {
    const [facets, library] = await Promise.all([
      getLibraryFacets(),
      getLibrary({ data: deps }),
    ]);

    return { facets, library };
  },
  loaderDeps: ({ search }: { search: LibrarySearchParameters }) => ({
    ...search,
    page: search.page ?? 1,
    search: search.search ?? "",
  }),
  validateSearch: librarySearchSchema,
});

// 🧩 Component

/**
 * The library page: a toolbar of search, filters, and sort over a masonry grid of authors, with
 * numbered pages beneath.
 */
function LibraryPage(): ReactNode {
  // 🪝 Hooks
  const navigate = Route.useNavigate();
  const {
    direction,
    limit = LIBRARY_PAGE_SIZE,
    page = 1,
    search = "",
    sort,
    ...filters
  } = Route.useSearch();
  const { facets, library } = Route.useLoaderData();

  // 🏗 Setup
  const hasFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );
  const pastEnd = isPastEnd(page, library.totalCount, library.pageCount);
  const count = `${String(library.totalCount)} ${library.totalCount === 1 ? "author" : "authors"}`;

  // 💪 Handlers
  const update = useCallback(
    (patch: Partial<LibrarySearchParameters>): void => {
      void navigate({ search: (previous) => ({ ...previous, ...patch }) });
    },
    [navigate],
  );
  const handleSearch = useCallback(
    (nextSearch: string): void => {
      update({ page: undefined, search: nextSearch || undefined });
    },
    [update],
  );
  const handleFilters = (next: LibraryFilterParameters): void => {
    void navigate({
      search: (previous) => ({
        direction: previous.direction,
        limit: previous.limit,
        search: previous.search,
        sort: previous.sort,
        ...next,
      }),
    });
  };
  const handleReset = (): void => {
    void navigate({
      search: (old) => ({ limit: old.limit, search: old.search }),
    });
  };
  const handleSort = (
    nextSort: typeof sort,
    nextDirection: typeof direction,
  ): void => {
    update({
      direction: nextSort === undefined ? undefined : nextDirection,
      page: undefined,
      sort: nextSort,
    });
  };
  const handleLimit = (nextLimit: number): void => {
    update({ limit: nextLimit, page: undefined });
  };
  const handlePage = (nextPage: number): void => {
    update({ page: nextPage === 1 ? undefined : nextPage });
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Library</h1>
      <LibraryToolbar
        direction={direction}
        facets={facets}
        filters={filters}
        limit={limit}
        onFilters={handleFilters}
        onLimit={handleLimit}
        onPage={handlePage}
        onReset={handleReset}
        onSearch={handleSearch}
        onSort={handleSort}
        page={page}
        pageCount={library.pageCount}
        search={search}
        sort={sort}
      />
      {library.totalCount === 0 ? (
        <LibraryNoResults
          hasFilters={hasFilters}
          onClearSearch={() => {
            handleSearch("");
          }}
          onResetFilters={() => {
            handleFilters({});
          }}
          search={search}
        />
      ) : pastEnd ? (
        <LibraryPastEnd
          onLastPage={() => {
            handlePage(library.pageCount);
          }}
          page={page}
          pageCount={library.pageCount}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{count}</p>
          <LibraryGrid
            authors={library.authors}
            query={{ ...filters, direction, search, sort }}
          />
          <LibraryPagination
            onPageChange={handlePage}
            page={page}
            pageCount={library.pageCount}
          />
        </>
      )}
    </section>
  );
}
