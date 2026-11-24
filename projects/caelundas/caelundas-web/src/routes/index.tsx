import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";
import { type ReactNode, useMemo, useSyncExternalStore } from "react";

import { CalendarDisplayMenu } from "../components/calendar-controls/calendar-display-menu/calendar-display-menu";
import { CalendarEmpty } from "../components/calendar-display/calendar-empty/calendar-empty";
import { CalendarError } from "../components/calendar-display/calendar-error/calendar-error";
import { CalendarSkeleton } from "../components/calendar-display/calendar-skeleton/calendar-skeleton";
import { TableGroupsProvider } from "../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider";
import { loadedKeys } from "../components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.constants";
import { loadCalendar } from "../components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities";
import {
  AGENDA_DAY_COUNT,
  CALENDAR_VIEW_PERIODS,
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
import { TagIconsProvider } from "../components/calendar-events/tag-icons-provider/tag-icons-provider";
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
// The calendar fills the viewport in the data's zone; the view the link names wins, else a phone opens on the table, wider on month.
function IndexPage(): ReactNode {
  // 🪝 Hooks
  const { dataset, emptiness, events, facets, grouping, presets } =
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
    handleColumnsChange,
    handleDateChange,
    handleFilterChange,
    handleGroupingChange,
    handleSortChange,
  } = useCalendarSearch(timeZone);
  const agendaDays = search.days ?? AGENDA_DAY_COUNT;

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
        <TagIconsProvider
          className="contents"
          facets={facets}
        >
          <TableGroupsProvider className="contents">
            <EventsCalendar
              agendaDays={agendaDays}
              anchor={anchor}
              className="min-h-0 flex-1"
              clusters={search.clusters !== false}
              colors={search.colors !== false}
              columns={search.columns}
              compact={!isWide}
              events={events}
              facets={facets}
              filters={
                <CalendarQueryControls
                  className="contents"
                  columns={search.columns}
                  display={
                    <CalendarDisplayMenu
                      className="contents"
                      timeZone={timeZone}
                      view={view}
                    />
                  }
                  facets={facets}
                  filter={search.filter}
                  grouping={grouping}
                  isDefaultGrouping={search.group === undefined}
                  onColumnsChange={handleColumnsChange}
                  onFilterChange={handleFilterChange}
                  onGroupingChange={handleGroupingChange}
                  onSortChange={handleSortChange}
                  presets={presets}
                  sort={search.sort}
                  view={view}
                />
              }
              grouping={grouping}
              onColumnsChange={handleColumnsChange}
              onDateChange={handleDateChange}
              onSortChange={handleSortChange}
              scale={search.scale}
              sort={search.sort}
              timeZone={timeZone}
              view={view}
            />
          </TableGroupsProvider>
        </TagIconsProvider>
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
