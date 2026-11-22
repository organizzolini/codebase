import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import { MeanderawLogo } from "../components/brand/meanderaw-logo/meanderaw-logo";
import { GalleryError } from "../components/gallery/gallery-error/gallery-error";
import {
  createFilterFields,
  sanitizeFilter,
  toFilterInput,
} from "../components/gallery/gallery-filters/components/filter-model/filter-model.utilities";
import { sanitizeRows } from "../components/gallery/gallery-filters/components/filter-model/filter-rows.utilities";
import { GalleryFilters } from "../components/gallery/gallery-filters/gallery-filters";
import { GalleryGroupBy } from "../components/gallery/gallery-group-by/gallery-group-by";
import {
  createGroupFields,
  resolveGrouping,
  toSequenceSorts,
} from "../components/gallery/gallery-group-by/gallery-group-by.utilities";
import { GalleryPager } from "../components/gallery/gallery-pager/gallery-pager";
import { GallerySort } from "../components/gallery/gallery-sort/gallery-sort";
import { resolveSorts } from "../components/gallery/gallery-sort/gallery-sort.utilities";
import { GalleryView as GalleryViewControl } from "../components/gallery/gallery-view/gallery-view";
import { GroupedGallery } from "../components/gallery/grouped-gallery/grouped-gallery";
import { MeanderGallery } from "../components/gallery/meander-gallery/meander-gallery";
import { listActiveKeys } from "../components/gallery/meander-gallery/meander-gallery.utilities";
import {
  findCharacteristics,
  findGallery,
} from "../components/gallery/meander-gallery/meanders-api.utilities";
import { useEndReached } from "../hooks/use-end-reached/use-end-reached";
import { useGallerySearch } from "../hooks/use-gallery-search/use-gallery-search";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_REPEATS,
  gallerySearchSchema,
} from "../hooks/use-gallery-search/use-gallery-search.constants";
import { toSortInput } from "../hooks/use-gallery-search/use-gallery-search.utilities";
import { useMeanders } from "../hooks/use-meanders/use-meanders";

import type { FilterGroup } from "../components/gallery/gallery-filters/components/filter-model/filter-model.types";
import type { FilterLink } from "../components/gallery/gallery-filters/components/filter-query/filter-query.types";
import type { GroupField } from "../components/gallery/gallery-group-by/gallery-group-by.types";
import type {
  GalleryCharacteristic,
  GalleryGroup,
  MeandersPage,
} from "../components/gallery/meander-gallery/meanders-api.types";
import type {
  GalleryView,
  SortEntry,
} from "../hooks/use-gallery-search/use-gallery-search.types";
import type { UseMeandersResult } from "../hooks/use-meanders/use-meanders.types";
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
    filter: search.filter,
    group: search.group,
    // Read as the rule it settles to, so adding the default to the link does
    // not read the first page a second time.
    repeats: search.repeats ?? DEFAULT_REPEATS,
    rows: sanitizeRows(search.rows),
    size: search.size ?? DEFAULT_PAGE_SIZE,
    sort: search.sort,
  }),
  ssr: false,

  loader: async ({ deps }) => {
    const characteristics = await findCharacteristics();
    // Sorts the catalog does not know are left out; none left, rows ascending.
    const sorts = resolveSorts(deps.sort, characteristics);
    // A filter the catalog cannot answer is left out of the read and the page.
    const filter = sanitizeFilter(
      deps.filter,
      createFilterFields(characteristics),
    );

    // A link without a valid rows rule gets the default one.
    const rows = sanitizeRows(deps.rows);
    // A level the catalog does not know is left out.
    const grouping = resolveGrouping(
      deps.group,
      createGroupFields(characteristics),
    );
    const { groups, page } = await findGallery({
      filter,
      grouping,
      repeats: deps.repeats,
      rows,
      size: deps.size,
      sorts,
    });

    return {
      characteristics,
      filter,
      grouping,
      groups,
      page,
      repeats: deps.repeats,
      rows,
      size: deps.size,
      sorts,
    };
  },
});

// 🧩 Component

/**
 * Renders the meanders of the pages showing, in groups when grouped, and asks
 * for the next page at the end.
 */
function GalleryBody(
  properties: Readonly<{
    catalog: readonly GalleryCharacteristic[];
    fields: readonly GroupField[];
    filter: FilterGroup | undefined;
    grouping: readonly string[];
    groups: GalleryGroup[] | undefined;
    paging: UseMeandersResult;
    repeats: number;
    size: number;
    sorts: readonly SortEntry[];
    view: GalleryView;
  }>,
): ReactNode {
  const {
    catalog,
    fields,
    filter,
    grouping,
    groups,
    paging,
    repeats,
    size,
    sorts,
    view,
  } = properties;
  // The characteristics every card shows first, whatever else it holds.
  const activeKeys = listActiveKeys({ filter, grouping, sorts });
  const { setElement: setEnd } = useEndReached(paging.append, paging.hasMore);
  const isWaiting = paging.isLoading && paging.meanders.length === 0;

  return (
    <>
      {isWaiting ? null : groups === undefined ? (
        <MeanderGallery
          activeKeys={activeKeys}
          catalog={catalog}
          loadError={paging.loadError}
          meanders={paging.meanders}
          onRetry={paging.retry}
          repeats={repeats}
          view={view}
        />
      ) : (
        <GroupedGallery
          activeKeys={activeKeys}
          catalog={catalog}
          fields={fields}
          grouping={grouping}
          groups={groups}
          loadError={paging.loadError}
          meanders={paging.meanders}
          offset={(paging.range.first - 1) * size}
          onRetry={paging.retry}
          repeats={repeats}
          view={view}
        />
      )}
      <div
        ref={setEnd}
        aria-hidden="true"
        data-testid="gallery-end"
      />
      {paging.isLoading ? (
        <p
          className="py-4 text-center text-sm text-muted-foreground"
          role="status"
        >
          Loading…
        </p>
      ) : null}
    </>
  );
}

/**
 * Renders the toolbar's controls, which flow inline: View, Group, Sort, the filter strip, and the pager.
 */
function GalleryControls(
  properties: Readonly<{
    characteristics: readonly GalleryCharacteristic[];
    groupFields: readonly GroupField[];
    grouping: readonly string[];
    link: FilterLink;
    page: MeandersPage;
    paging: UseMeandersResult;
    size: number;
    sorts: readonly SortEntry[];
    view: GalleryView;
  }>,
): ReactNode {
  const {
    characteristics,
    groupFields,
    grouping,
    link,
    page,
    paging,
    size,
    sorts,
    view,
  } = properties;
  const {
    handleFilterChange,
    handleGroupChange,
    handleSizeChange,
    handleSortChange,
    handleViewApply,
  } = useGallerySearch();
  const fields = useMemo(
    () => createFilterFields(characteristics),
    [characteristics],
  );

  return (
    <>
      <GalleryViewControl
        characteristics={characteristics}
        className="flex flex-wrap items-center gap-2"
        current={{ group: grouping, link, sorts, view }}
        onApply={handleViewApply}
      />
      <GalleryGroupBy
        fields={groupFields}
        grouping={grouping}
        onGroupingChange={handleGroupChange}
      />
      <GallerySort
        characteristics={characteristics}
        onSortsChange={handleSortChange}
        sorts={sorts}
      />
      <GalleryFilters
        className="min-w-0"
        fields={fields}
        link={link}
        onLinkChange={handleFilterChange}
      />
      <GalleryPager
        className="flex shrink-0 items-center gap-2"
        first={paging.range.first}
        last={paging.range.last}
        onPage={paging.select}
        onSizeChange={handleSizeChange}
        pageCount={paging.pageCount}
        size={size}
        total={page.totalCount}
      />
    </>
  );
}

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
  const {
    characteristics,
    filter,
    grouping: loaded,
    groups,
    page,
    repeats,
    rows,
    size,
    sorts,
  } = Route.useLoaderData();
  const { group, handleFilterChange, handleGroupChange, view } =
    useGallerySearch();
  const { filter: linkedFilter, rows: linkedRows } = Route.useSearch();
  // While a new sort reads, the cards of the last stay up under a notice.
  const isReloading = useRouterState({
    select: (state: { isLoading: boolean }) => state.isLoading,
  });

  // 🏗 Setup
  // What the API is asked, kept steady so the reads do not restart.
  // The meanders are one sequence, ordered by the levels, then the sorts.
  const input = useMemo(
    () => ({
      filter: toFilterInput(filter, rows),
      repeats,
      size,
      sort: toSortInput(toSequenceSorts(loaded, sorts)),
    }),
    [filter, loaded, repeats, rows, size, sorts],
  );
  const paging = useMeanders(page, input);
  const groupFields = useMemo(
    () => createGroupFields(characteristics),
    [characteristics],
  );
  // What the link holds of the filter, in the order the editor compares it.
  const link = useMemo(
    () => ({ filter, repeats, rows }),
    [filter, repeats, rows],
  );
  // A level the catalog does not know is left out of the page.
  const grouping = resolveGrouping(group, groupFields);

  // 💪 Handlers

  // ♻️ Lifecycle
  // A link carrying rules the catalog cannot answer is replaced by one that
  // does not, so what the address says is what is shown.
  useEffect(() => {
    if (
      JSON.stringify(filter) !== JSON.stringify(linkedFilter) ||
      JSON.stringify(rows) !== JSON.stringify(linkedRows)
    ) {
      handleFilterChange(link);
    }
  }, [filter, handleFilterChange, link, linkedFilter, linkedRows, rows]);

  // A link carrying levels the catalog does not know, or twice, is replaced
  // by one that does not.
  useEffect(() => {
    if (
      group !== undefined &&
      JSON.stringify(grouping) !== JSON.stringify(group)
    ) {
      handleGroupChange(grouping);
    }
  }, [group, grouping, handleGroupChange]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="flex flex-wrap items-center gap-2 p-4">
      <h1 className="mr-1">
        <MeanderawLogo className="h-9 text-(--ink)" />
      </h1>
      <GalleryControls
        characteristics={characteristics}
        groupFields={groupFields}
        grouping={grouping}
        link={link}
        page={page}
        paging={paging}
        size={size}
        sorts={sorts}
        view={view}
      />
      {isReloading ? (
        <p
          className="w-full text-sm text-muted-foreground"
          role="status"
        >
          Loading…
        </p>
      ) : null}
      <div className="mt-2 w-full">
        <GalleryBody
          catalog={characteristics}
          fields={groupFields}
          filter={filter}
          grouping={loaded}
          groups={groups}
          paging={paging}
          repeats={repeats}
          size={size}
          sorts={sorts}
          view={view}
        />
      </div>
    </section>
  );
}
