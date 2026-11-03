import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";
import { type ReactNode, useMemo, useSyncExternalStore } from "react";

import { CalendarEmpty } from "../components/calendar-empty/calendar-empty";
import { CalendarError } from "../components/calendar-error/calendar-error";
import { CalendarFilters } from "../components/calendar-filters/calendar-filters";
import { createEventFilterFields } from "../components/calendar-filters/event-filter-fields.utilities";
import { EMPTY_EVENT_FILTER } from "../components/calendar-filters/event-filter-tree.constants";
import { CalendarSkeleton } from "../components/calendar-skeleton/calendar-skeleton";
import { CalendarViewOptions } from "../components/calendar-view-options/calendar-view-options";
import { loadCalendar } from "../components/events-calendar/calendar-loader.utilities";
import {
  isWideViewport,
  subscribeToViewport,
} from "../components/events-calendar/calendar-viewport.utilities";
import {
  AGENDA_DAY_COUNT,
  CALENDAR_VIEW_PERIODS,
  DEFAULT_TIMELINE_SCALE,
} from "../components/events-calendar/calendar-views.constants";
import { getDefaultCalendarView } from "../components/events-calendar/calendar-views.utilities";
import { parseCalendarDate } from "../components/events-calendar/calendar-window.utilities";
import { EventsCalendar } from "../components/events-calendar/events-calendar";
import { readTimeZone } from "../components/events-calendar/events-calendar.utilities";
import { validateCalendarSearch } from "../hooks/use-calendar-search/calendar-search.utilities";
import {
  CalendarSymbolsContext,
  DEFAULT_CALENDAR_SYMBOLS,
} from "../hooks/use-calendar-search/calendar-symbols.constants";
import { useCalendarSearch } from "../hooks/use-calendar-search/use-calendar-search";

// 🧭 Route

/**
 * The landing page.
 */
// The calendar of astronomical events reads only in the browser: the static
// build renders a bare shell ahead of time, and the database lives in a
// worker. A first load that takes longer than a moment shows a skeleton, and
// a failed one an error.
//
// Every later load, a move to another day, view or filter, reloads in the
// background while the calendar it replaces stays on screen, so an open
// filter builder or a scrolled agenda survives it. That is why the search is
// read from the location rather than declared as loader dependencies: a
// dependency would make each search its own match, which shows the skeleton
// again. The loader's own cache, keyed by window and filter, stands in for
// the router's.
export const Route = createFileRoute("/")({
  component: IndexPage,
  errorComponent: IndexError,
  // The tab is named for the application, not for the project it is built in.
  head: () => ({ meta: [{ title: "Caelundas" }] }),
  pendingComponent: IndexPending,
  pendingMs: 200,
  shouldReload: true,
  ssr: false,
  validateSearch: validateCalendarSearch,

  loader: async ({ context, location }) =>
    loadCalendar(
      context.eventsDatabase,
      validateCalendarSearch(location.search),
    ),
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
// The calendar fills the viewport under its one toolbar row, and renders
// times in the zone the data was computed for. The view the link names wins;
// without one, a phone opens on the agenda and anything wider on the month,
// following the width as it changes. When the window holds no events, a
// notice over the calendar says why.
function IndexPage(): ReactNode {
  // 🪝 Hooks
  const { colorBy, dataset, emptiness, events, facets, grouping } =
    Route.useLoaderData();
  const search = Route.useSearch();
  const fields = useMemo(() => createEventFilterFields(facets), [facets]);
  const isWide = useSyncExternalStore(subscribeToViewport, isWideViewport);
  // While a reload runs, the notice of why the last window was empty would
  // speak for days no longer shown, so it waits for the new answer.
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
  const { filter } = search;
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
            <CalendarFilters
              className="contents"
              clusters={search.clusters !== false}
              colorBy={colorBy}
              colors={search.colors !== false}
              facets={facets}
              fields={fields}
              filter={filter}
              onClustersChange={handleClustersChange}
              onColorByChange={handleColorByChange}
              onColorsChange={handleColorsChange}
              onFilterChange={handleFilterChange}
              onSymbolsChange={handleSymbolsChange}
              symbols={search.symbols}
              viewOptions={
                <CalendarViewOptions
                  facets={facets}
                  grouping={grouping}
                  onGroupingChange={handleGroupingChange}
                  onScaleChange={handleScaleChange}
                  scale={search.scale ?? DEFAULT_TIMELINE_SCALE}
                  view={view}
                />
              }
            />
          }
          grouping={grouping}
          onDateChange={handleDateChange}
          onShowLater={handleShowLater}
          onViewChange={handleViewChange}
          scale={search.scale}
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
