import { createFileRoute } from "@tanstack/react-router";

import { LibraryGrid } from "../components/library-grid/library-grid";
import { librarySearchSchema } from "../components/library-grid/library-grid-api.constants";
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
  const handleSearch = (nextSearch: string): void => {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: undefined,
        search: nextSearch === "" ? undefined : nextSearch,
      }),
    });
  };
  const handleFilters = (next: LibraryFilterParameters): void => {
    void navigate({
      search: (previous) => ({
        direction: previous.direction,
        search: previous.search,
        sort: previous.sort,
        ...next,
      }),
    });
  };
  const handleReset = (): void => {
    void navigate({ search: (previous) => ({ search: previous.search }) });
  };
  const handleSort = (
    nextSort: typeof sort,
    nextDirection: typeof direction,
  ): void => {
    void navigate({
      search: (previous) => ({
        ...previous,
        direction: nextSort === undefined ? undefined : nextDirection,
        page: undefined,
        sort: nextSort,
      }),
    });
  };
  const handlePage = (nextPage: number): void => {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: nextPage === 1 ? undefined : nextPage,
      }),
    });
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
        onFilters={handleFilters}
        onReset={handleReset}
        onSearch={handleSearch}
        onSort={handleSort}
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
            search={search}
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
