import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";

import { GalleryError } from "../components/gallery-error/gallery-error";
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
  // The sort is read from the link, so a change to it reads the first page again.
  loaderDeps: ({ search }) => ({
    direction: search.direction ?? DEFAULT_SORT_DIRECTION,
    sort: search.sort,
  }),
  ssr: false,

  loader: async ({ deps }) => {
    const characteristics = await findCharacteristics();
    // A sort the catalog does not know falls back to the default order.
    const sort = resolveSortField(deps.sort, characteristics);
    const page = await findMeanders({
      sort: toSortInput(sort, deps.direction),
    });

    return { characteristics, page, sort };
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
  const { characteristics, page, sort } = Route.useLoaderData();
  const { direction, handleSortChange, handleViewChange, view } =
    useGallerySearch();
  // While a new sort reads, the cards of the last stay up under a notice.
  const isReloading = useRouterState({
    select: (state: { isLoading: boolean }) => state.isLoading,
  });

  // 🏗 Setup
  const { hasMore, loadError, loadMore, meanders } = useMeanders(
    page,
    toSortInput(sort, direction),
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="flex flex-col gap-4 p-4">
      <h1 className="text-xl">Meanderaw</h1>
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
      {isReloading ? (
        <p
          className="text-sm text-(--ink-muted)"
          role="status"
        >
          Loading…
        </p>
      ) : null}
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
