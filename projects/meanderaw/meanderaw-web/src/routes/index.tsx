import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";

import { GalleryError } from "../components/gallery-error/gallery-error";
import {
  createFilterFields,
  toFilterInput,
} from "../components/gallery-filter-builder/gallery-filter-builder.utilities";
import { GalleryFilters } from "../components/gallery-filters/gallery-filters";
import { GallerySort } from "../components/gallery-sort/gallery-sort";
import { GalleryToolbar } from "../components/gallery-toolbar/gallery-toolbar";
import { MeanderGallery } from "../components/meander-gallery/meander-gallery";
import {
  findCharacteristics,
  findMeanders,
} from "../components/meander-gallery/meanders-api.utilities";
import { useGallerySearch } from "../hooks/use-gallery-search/use-gallery-search";
import {
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
  // The sort and filter are read from the link, so a change to either reads
  // the first page again.
  loaderDeps: ({ search }) => ({
    direction: search.direction ?? DEFAULT_SORT_DIRECTION,
    filter: search.filter,
    sort: search.sort,
  }),
  ssr: false,

  loader: async ({ deps }) => {
    const [characteristics, page] = await Promise.all([
      findCharacteristics(),
      findMeanders({
        filter: toFilterInput(deps.filter),
        sort: toSortInput(deps.sort, deps.direction),
      }),
    ]);

    return { characteristics, page };
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
  const { characteristics, page } = Route.useLoaderData();
  const {
    direction,
    filter,
    handleFilterChange,
    handleSortChange,
    handleViewChange,
    sort,
    view,
  } = useGallerySearch();

  // 🏗 Setup
  const { hasMore, loadError, loadMore, meanders } = useMeanders(
    page,
    toSortInput(sort, direction),
    toFilterInput(filter),
  );
  const fields = createFilterFields(characteristics);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="flex flex-col gap-4 p-4">
      <h1 className="text-xl">Meanderaw</h1>
      <GalleryFilters
        fields={fields}
        filter={filter}
        onFilterChange={handleFilterChange}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GalleryToolbar
          onViewChange={handleViewChange}
          totalCount={page.totalCount}
          view={view}
        />
        <GallerySort
          characteristics={characteristics}
          direction={direction}
          field={sort}
          onSortChange={handleSortChange}
        />
      </div>
      <MeanderGallery
        hasMore={hasMore}
        loadError={loadError}
        meanders={meanders}
        onLoadMore={loadMore}
        view={view}
      />
    </section>
  );
}
