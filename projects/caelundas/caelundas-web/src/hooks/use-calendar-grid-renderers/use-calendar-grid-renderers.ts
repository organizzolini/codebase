import { createElement, useCallback } from "react";

import { CalendarDayLink } from "../../components/calendar-display/events-calendar/components/calendar-day-link/calendar-day-link";
import {
  describeEvent,
  formatDayHeading,
} from "../../components/calendar-display/events-calendar/components/calendar-format/calendar-format.utilities";
import { CalendarGridEvent } from "../../components/calendar-display/events-calendar/components/calendar-grid/calendar-grid-event";
import { CalendarAllDay } from "../../components/calendar-display/events-calendar/components/calendar-grid/components/calendar-all-day/calendar-all-day";
import { formatCalendarDate } from "../../components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";
import { CalendarOverflowList } from "../../components/calendar-events/calendar-overflow-list/calendar-overflow-list";

import type { CalendarEventRecord } from "../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  UseCalendarGridRenderersProperties,
  UseCalendarGridRenderersResult,
} from "./use-calendar-grid-renderers.types";
import type {
  EventCalendarRenderEventProps,
  EventCalendarSegment,
} from "@codebase/presentation";

// 🧩 Hook

/**
 * Makes the functions the event calendar draws its events, its all-day row, its week's day headings and its "+N more" lists with.
 */
export function useCalendarGridRenderers(
  properties: Readonly<UseCalendarGridRenderersProperties>,
): UseCalendarGridRenderersResult {
  const {
    allDayMode,
    clustered,
    events,
    groupColors,
    grouping,
    onAllDayModeChange,
    onOpenDay,
    timeZone,
  } = properties;

  // 🪝 Hooks
  // A chip's label holds only title and time; its tags are spelled out inside.
  const renderEvent = useCallback(
    (eventProperties: EventCalendarRenderEventProps<CalendarEventRecord>) => {
      const { event, eventId } = eventProperties.occurrence;

      return event.data === undefined
        ? event.title
        : createElement(CalendarGridEvent, {
            count: clustered.members.get(eventId)?.length ?? 0,
            description: describeEvent(
              clustered.origins.get(eventId) ?? event.data,
            ),
            eventId,
            expanded: clustered.expanded.has(eventId),
            group: clustered.groups.get(eventId),
            record: event.data,
          });
    },
    [clustered],
  );
  // A busy day's "+N more" lists the whole day, as a windowed list, out of
  // every event loaded rather than only the ones its cell left out.
  const renderMoreContent = useCallback(
    (moreProperties: { day: Date }) =>
      createElement(CalendarOverflowList, {
        day: formatCalendarDate(moreProperties.day, timeZone),
        events,
        timeZone,
      }),
    [events, timeZone],
  );
  const renderAllDaySection = useCallback(
    (section: {
      days: Date[];
      segments: EventCalendarSegment<CalendarEventRecord>[];
    }) =>
      createElement(CalendarAllDay, {
        days: section.days,
        groupColors,
        grouping,
        mode: allDayMode,
        onModeChange: (mode) => {
          onAllDayModeChange?.(mode);
        },
        segments: section.segments,
        timeZone,
      }),
    [allDayMode, groupColors, grouping, onAllDayModeChange, timeZone],
  );
  const renderDayHeader = useCallback(
    (heading: { day: Date; view: string }) => {
      const day = formatCalendarDate(heading.day, timeZone);

      const isWeek = heading.view === "week";

      // The week's heading opens its day; the day's only offers the menu. No other heading is the app's.
      return onOpenDay !== undefined && (isWeek || heading.view === "day")
        ? createElement(
            CalendarDayLink,
            {
              day,
              label: `Open ${day}`,
              level: isWeek ? "week" : "day",
              onOpen: isWeek
                ? () => {
                    onOpenDay("day", day);
                  }
                : undefined,
              onOpenDay,
            },
            formatDayHeading(heading.day, timeZone),
          )
        : undefined;
    },
    [onOpenDay, timeZone],
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    renderAllDaySection,
    renderDayHeader,
    renderEvent,
    renderMoreContent,
  };
}
