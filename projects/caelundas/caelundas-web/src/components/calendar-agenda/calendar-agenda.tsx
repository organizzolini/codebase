import { useMemo } from "react";

import { createEventGroupFields } from "../calendar-group-by/event-group-fields.utilities";
import { VirtualList } from "../virtual-list/virtual-list";

import { AgendaRowContent } from "./agenda-row-content";
import { LATER_ROW, NO_FACETS, NO_GROUPING } from "./calendar-agenda.constants";
import {
  getAgendaRowHeight,
  getAgendaRowKey,
  toGroupedAgendaRows,
} from "./calendar-agenda.utilities";

import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../events-calendar/calendar-records.types";
import type { AgendaListRow, AgendaRange } from "./calendar-agenda.types";
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
   * Lists more days when the agenda reaches its end; without it, the agenda lists no more.
   */
  onShowLater?: (() => void) | undefined;
  range: AgendaRange;
}

// 🧩 Component

/**
 * Renders the agenda: each day's events under a heading, drawn windowed so large ranges scroll smoothly.
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
