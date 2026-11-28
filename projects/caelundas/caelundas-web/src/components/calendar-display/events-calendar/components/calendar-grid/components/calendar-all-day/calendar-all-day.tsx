import { use, useMemo } from "react";

import { CalendarGroupChip } from "../../../calendar-group-chip/calendar-group-chip";
import { CalendarOpenGroups } from "../../../calendar-group-chip/components/calendar-open-groups/calendar-open-groups";
import { CalendarGroupSortContext } from "../../../calendar-groups/calendar-groups.constants";
import { groupCalendarEvents } from "../../../calendar-groups/calendar-groups.utilities";
import { formatCalendarDate } from "../../../calendar-window/calendar-window.utilities";

import { CalendarAllDayControl } from "./calendar-all-day-control";
import { ALL_DAY_MAX_HEIGHT } from "./calendar-all-day.constants";
import { getAllDayRecords } from "./calendar-all-day.utilities";

import type { EventGrouping } from "../../../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventGroup } from "../../../calendar-groups/calendar-groups.types";
import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { AllDayMode } from "./calendar-all-day.types";
import type { EventCalendarSegment } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The all-day row's days, their events, and how much to show.
 */
export interface CalendarAllDayProperties {
  className?: string;
  days: readonly Date[];
  groupColors: ReadonlyMap<string, string> | undefined;
  grouping: EventGrouping;
  mode: AllDayMode;
  onModeChange: (mode: AllDayMode) => void;
  segments: readonly EventCalendarSegment<CalendarEventRecord>[];
  timeZone: string;
}

// 🧩 Component

/**
 * Renders the all-day row: each day's events as one slim row of counts, openable groups, or every event, with its control.
 */
export function CalendarAllDay(
  properties: Readonly<CalendarAllDayProperties>,
): ReactNode {
  const {
    className,
    days,
    groupColors,
    grouping,
    mode,
    onModeChange,
    segments,
    timeZone,
  } = properties;

  // 🪝 Hooks
  const { ranks, roots, sorts } = use(CalendarGroupSortContext);
  const columns = useMemo(() => {
    const byDay = getAllDayRecords(segments);
    const built: {
      day: string;
      groups: CalendarEventGroup[];
      time: number;
    }[] = [];

    // A loop rather than a mapping callback keeps the call stack shallow.
    for (const day of days) {
      built.push({
        day: formatCalendarDate(day, timeZone),
        groups: groupCalendarEvents(byDay.get(day.getTime()) ?? [], {
          colors: groupColors,
          grouping,
          ranks,
          roots,
          sorts,
        }),
        time: day.getTime(),
      });
    }

    return built;
  }, [days, groupColors, grouping, ranks, segments, roots, sorts, timeZone]);

  // 🏗 Setup
  const isContracted = mode === "contracted";

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={`flex min-w-0 flex-1 ${className ?? ""}`}
      data-mode={mode}
      data-testid="calendar-all-day"
    >
      <CalendarAllDayControl
        className="text-muted-foreground flex w-(--ec-gutter-width,4.5rem) shrink-0 justify-end overflow-hidden border-e px-1 pt-1.5"
        mode={mode}
        onModeChange={onModeChange}
      />
      <div
        className={`grid min-w-0 flex-1 overflow-y-auto ${isContracted ? "" : ALL_DAY_MAX_HEIGHT}`}
        style={{
          gridTemplateColumns: `repeat(${String(days.length)}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((column) => (
          <div
            key={column.time}
            className="min-w-0 border-e p-1 last:border-e-0"
            data-slot="event-calendar-all-day-cell"
          >
            {isContracted ? (
              <div className="flex gap-1 overflow-hidden">
                {column.groups.map((group) => (
                  <CalendarGroupChip
                    key={group.id}
                    className="h-6 shrink-0"
                    color={group.color}
                    count={group.events.length}
                    group={group}
                    dense
                  />
                ))}
              </div>
            ) : (
              <CalendarOpenGroups
                key={mode}
                allOpen={mode === "expanded"}
                day={column.day}
                groupColors={groupColors}
                grouping={grouping}
                groups={column.groups}
                showTime={false}
                timeZone={timeZone}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
