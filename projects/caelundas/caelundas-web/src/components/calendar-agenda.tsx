import { useMemo } from "react";

import { Button } from "@codebase/presentation";

import {
  AGENDA_ROW_HEIGHTS,
  type AgendaRange,
  type AgendaRow,
  toAgendaRows,
} from "../lib/calendar/calendar-agenda";
import { formatCalendarDay } from "../lib/calendar/calendar-format";

import { CalendarEventRow } from "./calendar-event-row";
import { VirtualList } from "./virtual-list";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events loaded and the days the agenda lists of them.
 */
export interface CalendarAgendaProperties {
  className?: string;
  events: readonly CalendarEventRecord[];
  /**
   * Called to list more days, when the agenda is scrolled to its end or its
   * last row's button is pressed; without it, the agenda lists no more.
   */
  onShowLater?: (() => void) | undefined;
  range: AgendaRange;
}

/**
 * A row the agenda draws: a day, an event, or the button that lists more.
 */
type AgendaListRow = AgendaRow | { kind: "later" };

const LATER_ROW: AgendaListRow = { kind: "later" };

// 🧩 Component

/**
 * Renders the agenda: each day that has events as a heading over its events
 * in order, in a list that draws only the rows on screen, so a range with
 * thousands of events scrolls as smoothly as one with a handful. Scrolling
 * to the end asks for later days, which arrive under the rows already shown.
 */
export function CalendarAgenda(
  properties: Readonly<CalendarAgendaProperties>,
): ReactNode {
  const { className, events, onShowLater, range } = properties;

  // 🪝 Hooks
  const hasLater = onShowLater !== undefined;
  const rows = useMemo(
    (): AgendaListRow[] => [
      ...toAgendaRows(events, range),
      ...(hasLater ? [LATER_ROW] : []),
    ],
    [events, hasLater, range],
  );

  // 🏗 Setup

  // 💪 Handlers
  const renderRow = (row: AgendaListRow): ReactNode => (
    <AgendaRowContent
      onShowLater={onShowLater}
      row={row}
      timeZone={range.timeZone}
    />
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-agenda"
    >
      <VirtualList
        className="h-full"
        getRowHeight={getAgendaRowHeight}
        getRowKey={getAgendaRowKey}
        label="Agenda"
        onReachEnd={onShowLater}
        renderRow={renderRow}
        rows={rows}
      />
    </div>
  );
}

/**
 * Draws one agenda row: a day's heading, an event, or the button that lists
 * later days.
 */
function AgendaRowContent(
  properties: Readonly<{
    onShowLater: (() => void) | undefined;
    row: AgendaListRow;
    timeZone: string;
  }>,
): ReactNode {
  const { onShowLater, row, timeZone } = properties;

  if (row.kind === "day") {
    return (
      <h3 className="bg-muted/60 flex h-full items-center border-b px-4 text-sm font-semibold">
        {formatCalendarDay(row.day)}
      </h3>
    );
  }

  if (row.kind === "later") {
    return (
      <div className="flex h-full items-center justify-center">
        <Button
          onClick={onShowLater}
          size="sm"
          variant="outline"
        >
          Show later events
        </Button>
      </div>
    );
  }

  return (
    <CalendarEventRow
      className="h-full"
      ongoing={row.ongoing}
      record={row.record}
      timeZone={timeZone}
    />
  );
}

/**
 * How tall an agenda row is drawn: a day's heading is shorter than an event,
 * and the button that lists more is as tall as an event.
 */
function getAgendaRowHeight(row: AgendaListRow): number {
  return row.kind === "day" ? AGENDA_ROW_HEIGHTS.day : AGENDA_ROW_HEIGHTS.event;
}

/**
 * Names an agenda row by its day or its event, which each appear once.
 */
function getAgendaRowKey(row: AgendaListRow): string {
  if (row.kind === "event") {
    return row.record.id;
  }

  return row.kind === "day" ? row.day : row.kind;
}
