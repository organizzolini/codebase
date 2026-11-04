import { useSyncExternalStore } from "react";

import { Skeleton } from "@codebase/presentation";

import {
  isWideViewport,
  subscribeToViewport,
} from "../events-calendar/calendar-viewport.utilities";
import { getDefaultCalendarView } from "../events-calendar/calendar-views.utilities";

import { LAYOUTS } from "./calendar-skeleton.constants";
import { isWideOnServer } from "./calendar-skeleton.utilities";
import { SkeletonBody } from "./skeleton-body";

import type { CalendarViewName } from "../events-calendar/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The skeleton takes a class name and the view it stands in for; without a
 * view it stands in for the one the page opens on at the width it has.
 */
export interface CalendarSkeletonProperties {
  className?: string;
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders the shape of the view the page opens on, a toolbar row over that
 * view's layout: a grid of days for the month, columns of hours for the week,
 * three days or one, the agenda's list, or the timeline's bars on rows, while
 * the events database loads.
 */
export function CalendarSkeleton(
  properties: Readonly<CalendarSkeletonProperties>,
): ReactNode {
  const { className, view } = properties;

  // 🪝 Hooks
  // The skeleton is the pending component, so the build's shell page renders
  // it with no window to measure; it is drawn wide there, and settles on the
  // real width once it hydrates.
  const isWide = useSyncExternalStore(
    subscribeToViewport,
    isWideViewport,
    isWideOnServer,
  );

  // 🏗 Setup
  const shown = view ?? getDefaultCalendarView(isWide);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-skeleton"
    >
      <div
        aria-busy="true"
        aria-label="Loading events"
        className="flex h-dvh flex-col gap-2 p-2"
        data-layout={LAYOUTS[shown]}
        data-view={shown}
        role="status"
      >
        <div className="flex flex-wrap items-start gap-2">
          <Skeleton className="h-7 w-48 max-w-full" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-72 max-w-full" />
          <Skeleton className="h-7 w-36" />
        </div>
        <SkeletonBody view={shown} />
      </div>
    </div>
  );
}
