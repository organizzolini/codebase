import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";
import { type ReactNode, useMemo, useSyncExternalStore } from "react";

import { CalendarEmpty } from "../components/calendar-empty";
import { CalendarError } from "../components/calendar-error";
import { CalendarFilters } from "../components/calendar-filters";
import { CalendarSkeleton } from "../components/calendar-skeleton";
import { EventsCalendar } from "../components/events-calendar";
import { loadCalendar } from "../lib/calendar/calendar-loader";
import { validateCalendarSearch } from "../lib/calendar/calendar-search";
import {
  isWideViewport,
  subscribeToViewport,
} from "../lib/calendar/calendar-viewport";
import {
  AGENDA_DAY_COUNT,
  CALENDAR_VIEW_PERIODS,
  type CalendarViewName,
  getDefaultCalendarView,
  MAXIMUM_AGENDA_DAYS,
} from "../lib/calendar/calendar-views";
import {
  formatCalendarDate,
  parseCalendarDate,
} from "../lib/calendar/calendar-window";
import { createEventFilterFields } from "../lib/event-filters/event-filter-fields";
import { EMPTY_EVENT_FILTER } from "../lib/event-filters/event-filter-tree";

import type { EventFilterQuery } from "../lib/event-filters/event-filters.types";

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
  pendingComponent: CalendarSkeleton,
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
  const { dataset, emptiness, events, facets, grouping } =
    Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
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
  const timeZone =
    dataset?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 💪 Handlers
  // The agenda grows a month at a time, up to a year, in place: the link
  // is replaced rather than pushed, and the rows already listed stay put.
  const agendaDays = search.days ?? AGENDA_DAY_COUNT;
  const handleShowLater =
    agendaDays < MAXIMUM_AGENDA_DAYS
      ? (): void => {
          void navigate({
            replace: true,
            search: (previous) => ({
              ...previous,
              days: Math.min(
                MAXIMUM_AGENDA_DAYS,
                agendaDays + AGENDA_DAY_COUNT,
              ),
            }),
          });
        }
      : undefined;

  const handleViewChange = (next: CalendarViewName): void => {
    // The agenda's extra days belong to the agenda, so they are left behind.
    void navigate({
      search: (previous) => ({ ...previous, days: undefined, view: next }),
    });
  };

  const handleFilterChange = (next: EventFilterQuery): void => {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, filter: next }),
    });
  };

  const handleDateChange = (date: Date): void => {
    void navigate({
      search: (previous) => ({
        ...previous,
        date: formatCalendarDate(date, timeZone),
      }),
    });
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section
      aria-busy={isReloading}
      className="relative flex h-dvh flex-col"
    >
      <h1 className="sr-only">Caelundas</h1>
      <EventsCalendar
        agendaDays={agendaDays}
        anchor={anchor}
        className="min-h-0 flex-1"
        compact={!isWide}
        events={events}
        facets={facets}
        filters={
          <CalendarFilters
            className="contents"
            facets={facets}
            fields={fields}
            filter={filter}
            onFilterChange={handleFilterChange}
          />
        }
        grouping={grouping}
        onDateChange={handleDateChange}
        onGroupingChange={(next) => {
          void navigate({
            search: (previous) => ({ ...previous, group: next }),
          });
        }}
        onScaleChange={(scale) => {
          void navigate({
            search: (previous) => ({ ...previous, scale }),
          });
        }}
        onShowLater={handleShowLater}
        onViewChange={handleViewChange}
        scale={search.scale}
        timeZone={timeZone}
        view={view}
      />
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
