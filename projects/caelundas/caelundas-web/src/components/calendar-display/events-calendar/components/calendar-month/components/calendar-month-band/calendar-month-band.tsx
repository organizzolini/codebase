import { use, useMemo } from "react";

import { CalendarOpenGroups } from "../../../calendar-group-chip/components/calendar-open-groups/calendar-open-groups";
import { CalendarGroupSortContext } from "../../../calendar-groups/calendar-groups.constants";
import { groupCalendarEvents } from "../../../calendar-groups/calendar-groups.utilities";

import type { EventGrouping } from "../../../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events running through the month, and how to group them.
 */
export interface CalendarMonthBandProperties {
  className?: string;
  /**
   * The month's first day as `YYYY-MM-DD`, which its events are listed under.
   */
  day: string;
  events: readonly CalendarEventRecord[];
  groupColors: ReadonlyMap<string, string> | undefined;
  grouping: EventGrouping;
  timeZone: string;
}

// 🧩 Component

/**
 * The All month band: groups of the events running through every day of the month; none when none do.
 */
export function CalendarMonthBand(
  properties: Readonly<CalendarMonthBandProperties>,
): ReactNode {
  const { className, day, events, groupColors, grouping, timeZone } =
    properties;

  // 🪝 Hooks
  const { ranks, roots, sorts } = use(CalendarGroupSortContext);
  const groups = useMemo(
    () =>
      groupCalendarEvents(events, {
        colors: groupColors,
        grouping,
        ranks,
        roots,
        sorts,
      }),
    [events, groupColors, grouping, ranks, roots, sorts],
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (groups.length === 0) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      aria-label="All month"
      className={`flex max-h-[30vh] gap-2 overflow-y-auto border-b p-1 ${className ?? ""}`}
      data-testid="calendar-month-band"
      role="row"
    >
      <span className="bg-background text-muted-foreground h-6 shrink-0 rounded-md border px-2 text-xs leading-6">
        All month
      </span>
      <CalendarOpenGroups
        className="flex-1"
        day={day}
        groups={groups}
        timeZone={timeZone}
      />
    </div>
  );
}
