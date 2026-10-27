import { AGENDA_ROW_HEIGHTS } from "../constants/calendar-agenda.constants";
import { getEventRowHeight } from "../utilities/calendar-agenda.utilities";

import { EVENT_COUNT_RULES } from "./calendar-agenda.constants";

import type { AgendaListRow } from "./calendar-agenda.types";

/**
 * Counts a group's events, such as "1 event" or "12 events".
 */
export function formatEventCount(count: number): string {
  return `${String(count)} ${EVENT_COUNT_RULES.select(count) === "one" ? "event" : "events"}`;
}

/**
 * How tall an agenda row is drawn: a heading is shorter than an event, an
 * event is as tall as its tags need, and the button that lists more is as tall
 * as an event with none.
 */
export function getAgendaRowHeight(row: AgendaListRow, width: number): number {
  if (row.kind === "event") {
    return getEventRowHeight(row.record.tags, width);
  }

  return row.kind === "later"
    ? AGENDA_ROW_HEIGHTS.event
    : AGENDA_ROW_HEIGHTS[row.kind];
}

/**
 * Names an agenda row by its group, its day or its event within its group,
 * each of which appears once.
 */
export function getAgendaRowKey(row: AgendaListRow): string {
  if (row.kind === "group") {
    return row.node.id;
  }

  if (row.kind === "later") {
    return row.kind;
  }

  const name = row.kind === "day" ? row.day : row.record.id;

  return `${row.group ?? ""}|${name}`;
}
