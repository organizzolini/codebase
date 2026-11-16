import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import { GalleryError } from "../components/gallery-error/gallery-error";
import { sanitizeRows } from "../components/gallery-filter-builder/filter-rows.utilities";
import { DEFAULT_ROWS_FILTER } from "../components/gallery-filter-builder/gallery-filter-builder.constants";
import {
  createFilterFields,
  sanitizeFilter,
  toFilterInput,
} from "../components/gallery-filter-builder/gallery-filter-builder.utilities";
import { GalleryFilters } from "../components/gallery-filters/gallery-filters";
import { GalleryRepeats } from "../components/gallery-repeats/gallery-repeats";
import { GallerySort } from "../components/gallery-sort/gallery-sort";
import { resolveSortField } from "../components/gallery-sort/gallery-sort.utilities";
import { GalleryToolbar } from "../components/gallery-toolbar/gallery-toolbar";
import { MeanderGallery } from "../components/meander-gallery/meander-gallery";
import {
  findCharacteristics,
  findMeanders,
} from "../components/meander-gallery/meanders-api.utilities";
import { useGallerySearch } from "../hooks/use-gallery-search/use-gallery-search";
import {
  DEFAULT_REPEATS,
  DEFAULT_SORT_DIRECTION,
  gallerySearchSchema,
} from "../hooks/use-gallery-search/use-gallery-search.constants";
import { toSortInput } from "../hooks/use-gallery-search/use-gallery-search.utilities";
import { useMeanders } from "../hooks/use-meanders/use-meanders";

import type { ReactNode } from "react";

// 🧭 Route

/**
 * The landing page.
 */
// The meanders come from the Meanderaw API, read in the browser only.
export const Route = createFileRoute("/")({
  component: IndexPage,
  errorComponent: IndexError,
  head: () => ({ meta: [{ title: "Meanderaw" }] }),
  validateSearch: (search: Record<string, unknown>) =>
    gallerySearchSchema.parse(search),
  // The sort, filter and rows rule are read from the link, so a change to
  // any reads the first page again.
  loaderDeps: ({ search }) => ({
    direction: search.direction ?? DEFAULT_SORT_DIRECTION,
    filter: search.filter,
    // Read as the rule it settles to, so adding the default to the link does
    // not read the first page a second time.
    repeats: search.repeats ?? DEFAULT_REPEATS,
    rows: sanitizeRows(search.rows),
    sort: search.sort,
  }),
  ssr: false,

  loader: async ({ deps }) => {
    const characteristics = await findCharacteristics();
    // A sort the catalog does not know falls back to the default order.
    const sort = resolveSortField(deps.sort, characteristics);
    // A filter the catalog cannot answer is left out of the read and the page.
    const filter = sanitizeFilter(
      deps.filter,
      createFilterFields(characteristics),
    );

    // A link without a valid rows rule gets the default one.
    const rows = sanitizeRows(deps.rows);
    const page = await findMeanders({
      filter: toFilterInput(filter, rows),
      repeats: deps.repeats,
      sort: toSortInput(sort, deps.direction),
    });

    return {
      characteristics,
      filter,
      page,
      repeats: deps.repeats,
      rows,
      sort,
    };
  },
});

// 🧩 Component

/**
 * Renders a failed load, retrying by running the loader again.
 */
function IndexError(properties: Readonly<ErrorComponentProps>): ReactNode {
  const { error } = properties;
  // Typed by hand: this route is part of the tree the registered router type
  // is built from, so inferring it here would be circular.
  const router: { invalidate: () => Promise<void> } = useRouter();

  return (
    <GalleryError
      className="p-4"
      error={error}
      onRetry={() => {
        void router.invalidate();
      }}
    />
  );
}

/**
 * Renders the landing page's heading.
 */
function IndexPage(): ReactNode {
  // 🪝 Hooks
  const { characteristics, filter, page, repeats, rows, sort } =
    Route.useLoaderData();
  const {
    direction,
    handleFilterChange,
    handleRepeatsChange,
    handleSortChange,
    handleViewChange,
    view,
  } = useGallerySearch();
  const { filter: linkedFilter, rows: linkedRows } = Route.useSearch();
  // While a new sort reads, the cards of the last stay up under a notice.
  const isReloading = useRouterState({
    select: (state: { isLoading: boolean }) => state.isLoading,
  });

  const query = useMemo(
    () => ({
      filter: toFilterInput(filter, rows),
      repeats,
      sort: toSortInput(sort, direction),
    }),
    [direction, filter, repeats, rows, sort],
  );
  const fields = createFilterFields(characteristics);

  // 🏗 Setup
  const { hasMore, loadError, loadMore, meanders } = useMeanders(page, query);

  // 💪 Handlers

  // ♻️ Lifecycle
  // A link carrying rules the catalog cannot answer is replaced by one that
  // does not, so what the address says is what is shown.
  useEffect(() => {
    if (
      JSON.stringify(filter) !== JSON.stringify(linkedFilter) ||
      JSON.stringify(rows) !== JSON.stringify(linkedRows)
    ) {
      handleFilterChange(filter, rows);
    }
  }, [filter, handleFilterChange, linkedFilter, linkedRows, rows]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="flex flex-col gap-4 p-4">
      <h1 className="text-xl">Meanderaw</h1>
      <GalleryFilters
        fields={fields}
        filter={filter}
        onClear={() => {
          handleFilterChange(undefined, DEFAULT_ROWS_FILTER);
        }}
        onFilterChange={(next) => {
          handleFilterChange(next, rows);
        }}
        onRowsChange={(next) => {
          handleFilterChange(filter, next);
        }}
        rows={rows}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GalleryToolbar
          onViewChange={handleViewChange}
          totalCount={page.totalCount}
          view={view}
        />
        <GalleryRepeats
          onRepeatsChange={handleRepeatsChange}
          repeats={repeats}
        />
        <GallerySort
          characteristics={characteristics}
          direction={direction}
          field={sort}
          onSortChange={handleSortChange}
        />
      </div>
      {isReloading ? (
        <p
          className="text-sm text-(--ink-muted)"
          role="status"
        >
          Loading…
        </p>
      ) : null}
      <MeanderGallery
        catalog={characteristics}
        hasMore={hasMore}
        loadError={loadError}
        meanders={meanders}
        onLoadMore={loadMore}
        repeats={repeats}
        view={view}
      />
    </section>
  );
}
