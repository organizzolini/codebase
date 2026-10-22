import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";

import { CalendarEmpty } from "../components/calendar-empty";
import { CalendarError } from "../components/calendar-error";
import { CalendarSkeleton } from "../components/calendar-skeleton";
import { EventsCalendar } from "../components/events-calendar";
import { loadCalendarMonth } from "../lib/calendar/calendar-loader";
import { validateCalendarSearch } from "../lib/calendar/calendar-search";
import { formatCalendarDate } from "../lib/calendar/calendar-window";

import type { ReactNode } from "react";

// 🧭 Route

/**
 * The landing page.
 */
// The calendar of astronomical events reads only in the browser: the static
// build renders a bare shell ahead of time, and the database lives in a
// worker. A load that takes longer than a moment shows a skeleton, and a
// failed one an error.
export const Route = createFileRoute("/")({
  component: IndexPage,
  errorComponent: IndexError,
  pendingComponent: CalendarSkeleton,
  pendingMs: 200,
  ssr: false,
  validateSearch: validateCalendarSearch,

  // The dependencies are declared ahead of the loader so their type flows
  // into it.
  loaderDeps: ({ search }) => ({ date: search.date }),

  loader: async ({ context, deps }) =>
    loadCalendarMonth(context.eventsDatabase, deps.date),
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
// The month view fills the viewport under its one toolbar row, and renders
// times in the zone the data was computed for. When the month holds no
// events, a notice over the calendar says why.
function IndexPage(): ReactNode {
  // 🪝 Hooks
  const { anchor, dataset, emptiness, events } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  // 🏗 Setup
  const timeZone =
    dataset?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 💪 Handlers
  const handleDateChange = (date: Date): void => {
    void navigate({ search: { date: formatCalendarDate(date, timeZone) } });
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="relative flex h-dvh flex-col">
      <h1 className="sr-only">Caelundas</h1>
      <EventsCalendar
        anchor={anchor}
        className="min-h-0 flex-1"
        events={events}
        onDateChange={handleDateChange}
        timeZone={timeZone}
      />
      {emptiness === null ? null : (
        <CalendarEmpty
          className="pointer-events-none absolute inset-x-0 top-1/3 z-40 flex justify-center px-4"
          emptiness={emptiness}
          onJump={handleDateChange}
        />
      )}
    </section>
  );
}
