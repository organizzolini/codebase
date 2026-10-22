import { useMemo } from "react";

import { Button } from "@codebase/presentation";

import {
  AGENDA_ROW_HEIGHTS,
  type AgendaRange,
  type AgendaRow,
  toGroupedAgendaRows,
} from "../lib/calendar/calendar-agenda";
import { formatCalendarDay } from "../lib/calendar/calendar-format";
import { createEventGroupFields } from "../lib/event-groups/event-group-fields";

import { CalendarEventRow } from "./calendar-event-row";
import { VirtualList } from "./virtual-list";

import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events loaded and the days the agenda lists of them.
 */
export interface CalendarAgendaProperties {
  className?: string;
  events: readonly CalendarEventRecord[];
  /**
   * The tag roots the data has, which name the groups.
   */
  facets?: readonly EventFacet[] | undefined;
  /**
   * The levels the agenda is sectioned by, which the events' `groups` were
   * read for; not sectioned when absent or empty.
   */
  grouping?: readonly EventGroupLevel[] | undefined;
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

const NO_FACETS: readonly EventFacet[] = [];
const NO_GROUPING: readonly EventGroupLevel[] = [];

// Headings start below the page's and the toolbar's.
const HEADING_TAGS = ["h3", "h4", "h5", "h6"] as const;
const EVENT_COUNT_RULES = new Intl.PluralRules("en-US");

// 🧩 Component

/**
 * Renders the agenda: each day that has events as a heading over its events
 * in order, in a list that draws only the rows on screen, so a range with
 * thousands of events scrolls as smoothly as one with a handful. Grouped, it
 * is sectioned by each group, with the distinct events it lists counted.
 * Scrolling to the end asks for later days, which arrive under the rows
 * already shown.
 */
export function CalendarAgenda(
  properties: Readonly<CalendarAgendaProperties>,
): ReactNode {
  const {
    className,
    events,
    facets = NO_FACETS,
    grouping = NO_GROUPING,
    onShowLater,
    range,
  } = properties;

  // 🪝 Hooks
  const hasLater = onShowLater !== undefined;
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const rows = useMemo(
    (): AgendaListRow[] => [
      ...toGroupedAgendaRows(events, range, { fields, levels: grouping }),
      ...(hasLater ? [LATER_ROW] : []),
    ],
    [events, fields, grouping, hasLater, range],
  );

  // 🏗 Setup

  // 💪 Handlers
  const renderRow = (row: AgendaListRow): ReactNode => (
    <AgendaRowContent
      dayLevel={grouping.length}
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
    /**
     * How many group headings rank above a day's.
     */
    dayLevel: number;
    onShowLater: (() => void) | undefined;
    row: AgendaListRow;
    timeZone: string;
  }>,
): ReactNode {
  const { dayLevel, onShowLater, row, timeZone } = properties;

  if (row.kind === "group") {
    const Heading = HEADING_TAGS[row.node.level] ?? "h6";

    return (
      <Heading
        className="bg-background flex h-full items-center gap-2 border-b px-4 font-semibold"
        style={{ paddingInlineStart: `${String(1 + row.node.level)}rem` }}
      >
        <span className="truncate">{row.node.label}</span>{" "}
        <span className="text-muted-foreground shrink-0 text-xs font-normal">
          {formatEventCount(row.node.count)}
        </span>
      </Heading>
    );
  }

  if (row.kind === "day") {
    const Heading = HEADING_TAGS[dayLevel] ?? "h6";

    return (
      <Heading className="bg-muted/60 flex h-full items-center border-b px-4 text-sm font-semibold">
        {formatCalendarDay(row.day)}
      </Heading>
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
 * Counts a group's events, such as "1 event" or "12 events".
 */
function formatEventCount(count: number): string {
  return `${String(count)} ${EVENT_COUNT_RULES.select(count) === "one" ? "event" : "events"}`;
}

/**
 * How tall an agenda row is drawn: a heading is shorter than an event, and
 * the button that lists more is as tall as an event.
 */
function getAgendaRowHeight(row: AgendaListRow): number {
  return row.kind === "later"
    ? AGENDA_ROW_HEIGHTS.event
    : AGENDA_ROW_HEIGHTS[row.kind];
}

/**
 * Names an agenda row by its group, its day or its event within its group,
 * each of which appears once.
 */
function getAgendaRowKey(row: AgendaListRow): string {
  if (row.kind === "group") {
    return row.node.id;
  }

  if (row.kind === "later") {
    return row.kind;
  }

  const name = row.kind === "day" ? row.day : row.record.id;

  return `${row.group ?? ""}|${name}`;
}
