import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@codebase/presentation";

import { LibraryGrid } from "../components/library-grid/library-grid";
import { librarySearchSchema } from "../components/library-grid/library-grid-api.constants";
import { getLibrary } from "../components/library-grid/library-grid.constants";
import { LibraryPagination } from "../components/library-pagination/library-pagination";
import {
  isPastEnd,
  pastEndMessage,
} from "../components/library-pagination/library-pagination.utilities";
import { LibrarySearch } from "../components/library-search/library-search";

import type {
  GetLibraryInput,
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
  loader: async ({ deps }: { deps: GetLibraryInput }) =>
    getLibrary({ data: deps }),
  loaderDeps: ({ search }: { search: LibrarySearchParameters }) => ({
    page: search.page ?? 1,
    search: search.search ?? "",
  }),
  validateSearch: librarySearchSchema,
});

// 🧩 Component

/**
 * The library page: a search box over a masonry grid of authors, with
 * numbered pages beneath.
 */
function LibraryPage(): ReactNode {
  // 🪝 Hooks
  const navigate = Route.useNavigate();
  const { page = 1, search = "" } = Route.useSearch();
  const library = Route.useLoaderData();

  // 🏗 Setup
  const pastEnd = isPastEnd(page, library.totalCount, library.pageCount);
  const count = `${String(library.totalCount)} ${library.totalCount === 1 ? "author" : "authors"}`;

  // 💪 Handlers
  const handleSearch = (nextSearch: string): void => {
    void navigate({ search: nextSearch === "" ? {} : { search: nextSearch } });
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
      <LibrarySearch
        key={search}
        onSearch={handleSearch}
        search={search}
      />
      {library.totalCount === 0 ? (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {search === ""
              ? "The library is empty."
              : `No authors match ${search}`}
          </p>
          {search === "" ? null : (
            <Button
              onClick={() => {
                handleSearch("");
              }}
              variant="outline"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : pastEnd ? (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {pastEndMessage(page, library.pageCount)}
          </p>
          <Button
            onClick={() => {
              handlePage(library.pageCount);
            }}
            variant="outline"
          >
            {`Go to page ${String(library.pageCount)}`}
          </Button>
        </div>
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
