import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";
import { type ReactNode, useMemo, useSyncExternalStore } from "react";

import { CalendarMenus } from "../components/calendar-controls/calendar-menus/calendar-menus";
import { CalendarViewOptions } from "../components/calendar-controls/calendar-view-options/calendar-view-options";
import { CalendarEmpty } from "../components/calendar-display/calendar-empty/calendar-empty";
import { CalendarError } from "../components/calendar-display/calendar-error/calendar-error";
import { CalendarSkeleton } from "../components/calendar-display/calendar-skeleton/calendar-skeleton";
import { loadedKeys } from "../components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.constants";
import { loadCalendar } from "../components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities";
import {
  AGENDA_DAY_COUNT,
  CALENDAR_VIEW_PERIODS,
  DEFAULT_TIMELINE_SCALE,
} from "../components/calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { getDefaultCalendarView } from "../components/calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import {
  isWideViewport,
  subscribeToViewport,
} from "../components/calendar-display/events-calendar/components/calendar-window/calendar-viewport.utilities";
import { parseCalendarDate } from "../components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";
import { EventsCalendar } from "../components/calendar-display/events-calendar/events-calendar";
import { readTimeZone } from "../components/calendar-display/events-calendar/events-calendar.utilities";
import {
  CalendarSymbolsContext,
  DEFAULT_CALENDAR_SYMBOLS,
} from "../components/calendar-events/event-glyphs/calendar-symbols.constants";
import { EMPTY_EVENT_FILTER } from "../components/calendar-query/calendar-filters/components/event-filter-model/event-filter-tree.constants";
import { CalendarQueryControls } from "../components/calendar-query/calendar-query-controls/calendar-query-controls";
import {
  getCalendarReloadKey,
  readCalendarSearch,
  validateCalendarSearch,
} from "../hooks/use-calendar-search/calendar-search.utilities";
import { useCalendarSearch } from "../hooks/use-calendar-search/use-calendar-search";

// 🧭 Route

/**
 * The landing page.
 */
// The calendar reads only in the browser: the events come from the Caelundas API, and a slow first load shows a skeleton.
//
// Later loads reload in the background, so the page stays up; search is read from the location, not loader dependencies.
export const Route = createFileRoute("/")({
  component: IndexPage,
  errorComponent: IndexError,
  // The tab is named for the application, not for the project it is built in.
  head: () => ({ meta: [{ title: "Caelundas" }] }),
  pendingComponent: IndexPending,
  pendingMs: 200,
  // A change to the backdrop's keys alone skips even the reload.
  shouldReload: ({ location }) =>
    getCalendarReloadKey(location.search) !== loadedKeys.current,
  ssr: false,
  validateSearch: validateCalendarSearch,

  loader: async ({ location, preload }) => {
    if (!preload) {
      loadedKeys.current = getCalendarReloadKey(location.search);
    }

    return loadCalendar(validateCalendarSearch(location.search));
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
    <CalendarError
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
// The calendar fills the viewport in the data's zone; the view the link names wins, else a phone opens on agenda, wider on month.
function IndexPage(): ReactNode {
  // 🪝 Hooks
  const { colorBy, dataset, emptiness, events, facets, grouping, presets } =
    Route.useLoaderData();
  // The calendar's own search only: structural sharing hands back the same
  // object when a sky key alone changed, so the page is not rendered again.
  const search = Route.useSearch({
    select: readCalendarSearch,
    structuralSharing: true,
  });
  const isWide = useSyncExternalStore(subscribeToViewport, isWideViewport);
  // While a reload runs, the notice of why the window was empty waits for the new answer.
  const isReloading = Route.useMatch({
    select: (match) => match.isFetching !== false,
  });
  // The day and view follow the link at once; the events they show catch up
  // when the reload behind them lands.
  const anchor = useMemo(
    () => parseCalendarDate(search.date, new Date()),
    [search.date],
  );

  // 🏗 Setup
  const view = search.view ?? getDefaultCalendarView(isWide);
  const timeZone = readTimeZone(dataset);

  // 💪 Handlers
  const {
    getShowLater,
    handleClustersChange,
    handleColorByChange,
    handleColorsChange,
    handleDateChange,
    handleFilterChange,
    handleGroupingChange,
    handleScaleChange,
    handleSortChange,
    handleSymbolsChange,
    handleViewChange,
  } = useCalendarSearch(timeZone);
  // The agenda grows a month at a time, up to a year, in place: the link
  // is replaced rather than pushed, and the rows already listed stay put.
  const agendaDays = search.days ?? AGENDA_DAY_COUNT;
  const handleShowLater = getShowLater(agendaDays);

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section
      aria-busy={isReloading}
      className="relative flex h-dvh flex-col"
    >
      <h1 className="sr-only">Caelundas</h1>
      <CalendarSymbolsContext
        value={search.symbols ?? DEFAULT_CALENDAR_SYMBOLS}
      >
        <EventsCalendar
          agendaDays={agendaDays}
          anchor={anchor}
          className="min-h-0 flex-1"
          clusters={search.clusters !== false}
          colorBy={colorBy}
          colors={search.colors !== false}
          compact={!isWide}
          events={events}
          facets={facets}
          filters={
            <CalendarQueryControls
              className="contents"
              facets={facets}
              filter={search.filter}
              grouping={grouping}
              onFilterChange={handleFilterChange}
              onGroupingChange={handleGroupingChange}
              onSortChange={handleSortChange}
              presets={presets}
              sort={search.sort}
              view={view}
            />
          }
          grouping={grouping}
          menus={
            <CalendarMenus
              className="contents"
              clusters={search.clusters !== false}
              colorBy={colorBy}
              colors={search.colors !== false}
              facets={facets}
              onClustersChange={handleClustersChange}
              onColorByChange={handleColorByChange}
              onColorsChange={handleColorsChange}
              onSymbolsChange={handleSymbolsChange}
              symbols={search.symbols}
              viewOptions={
                <CalendarViewOptions
                  onScaleChange={handleScaleChange}
                  scale={search.scale ?? DEFAULT_TIMELINE_SCALE}
                  view={view}
                />
              }
            />
          }
          onDateChange={handleDateChange}
          onShowLater={handleShowLater}
          onViewChange={handleViewChange}
          scale={search.scale}
          sort={search.sort}
          timeZone={timeZone}
          view={view}
        />
      </CalendarSymbolsContext>
      {emptiness === null || isReloading ? null : (
        <CalendarEmpty
          className="pointer-events-none absolute inset-x-0 top-1/3 z-40 flex justify-center px-4"
          emptiness={emptiness}
          onClearFilters={() => {
            handleFilterChange(EMPTY_EVENT_FILTER);
          }}
          onJump={handleDateChange}
          period={CALENDAR_VIEW_PERIODS[view]}
        />
      )}
    </section>
  );
}

/**
 * Renders the skeleton of the view the link names while the first load runs.
 */
function IndexPending(): ReactNode {
  return <CalendarSkeleton view={Route.useSearch().view} />;
}
