import {
  MAXIMUM_AGENDA_DAYS,
  TIMELINE_SCALES,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { isMetricView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { DAY_MILLISECONDS } from "../../calendar-display/events-calendar/components/calendar-window/calendar-window.constants";
import {
  addCalendarDays,
  getViewWindows,
  parseCalendarDate,
} from "../../calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";

import {
  DATE_PICKER_MODES,
  LAYOUT_UNITS,
  MODE_MONTHS,
  MODE_RANKS,
  MONTH_LABELS,
} from "./calendar-date-picker.constants";

import type {
  CalendarViewName,
  TimelineScale,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type {
  DatePickerMode,
  DateRangeValue,
  DateWindowSearch,
  GridMode,
  PeriodCell,
} from "./calendar-date-picker.types";

// 🔏 Private Functions

/**
 * How many days a range holds, both ends included.
 */
export function countRangeDays(range: DateRangeValue): number {
  return (
    Math.round((toUtc(range.to) - toUtc(range.from)) / DAY_MILLISECONDS) + 1
  );
}

/**
 * What the grid's header says of its cursor.
 */
export function formatGridCursor(mode: GridMode, cursor: number): string {
  return mode === "year" ? `${cursor} – ${cursor + 11}` : String(cursor);
}

/**
 * What a month cursor's header says: the month and year.
 */
export function formatMonthCursor(cursor: string): string {
  const [year = "", month = "1"] = cursor.split("-");

  return `${MONTH_LABELS[Number(month) - 1] ?? ""} ${year}`;
}

/**
 * Reads a range as one day or `from – to`, the form the toolbar's titles take.
 */
export function formatRange(range: DateRangeValue): string {
  return range.from === range.to ? range.from : `${range.from} – ${range.to}`;
}

/**
 * A week as a compact range: `Nov 22 – 28`, or `Nov 29 – Dec 5` across months.
 */
export function formatWeekLabel(range: DateRangeValue): string {
  const [, fromMonth = "1", fromDate = "1"] = range.from.split("-");
  const [, toMonth = "1", toDate = "1"] = range.to.split("-");
  const from = `${MONTH_LABELS[Number(fromMonth) - 1] ?? ""} ${Number(fromDate)}`;

  if (fromMonth === toMonth) {
    return `${from} – ${Number(toDate)}`;
  }

  return `${from} – ${MONTH_LABELS[Number(toMonth) - 1] ?? ""} ${Number(toDate)}`;
}

/**
 * The cursor a grid opens at for a range: its year, or the first year of the twelve holding it.
 */
export function getGridCursor(mode: GridMode, range: DateRangeValue): number {
  const year = Number(range.from.slice(0, 4));

  return mode === "year" ? year - (year % 12) : year;
}

// 🌎 Public Functions

/**
 * What a layout that shows one unit says of a longer span: it opens on the start.
 */
export function getLayoutHint(
  view: CalendarViewName,
  mode: DatePickerMode,
): string | undefined {
  const unit = LAYOUT_UNITS[view];

  if (unit === undefined || MODE_RANKS[mode] <= MODE_RANKS[unit]) {
    return undefined;
  }

  return `The ${view} view shows the ${unit} of the start.`;
}

/**
 * The first of the month a range starts in, where the week grid opens.
 */
export function getMonthCursor(range: DateRangeValue): string {
  return `${range.from.slice(0, "YYYY-MM".length)}-01`;
}

/**
 * The span of a mode that holds a day, moved a number of spans along.
 */
export function getPeriod(
  mode: DatePickerMode,
  day: string,
  offset = 0,
): DateRangeValue {
  if (mode === "day") {
    const shifted = addCalendarDays(day, offset);

    return { from: shifted, to: shifted };
  }

  if (mode === "week") {
    // Weeks start on Sunday, as the calendar draws them.
    const weekday = new Date(toUtc(day)).getUTCDay();
    const sunday = addCalendarDays(day, offset * 7 - weekday);

    return { from: sunday, to: addCalendarDays(sunday, 6) };
  }

  return getMonthSpan(day, MODE_MONTHS[mode], offset);
}

/**
 * The days a view shows now, which the picker opens on: the month view's own month, not its leading and trailing days.
 */
export function getPickerRange(
  view: CalendarViewName,
  anchor: Date,
  options: Readonly<{
    agendaDays?: number | undefined;
    scale?: TimelineScale | undefined;
  }>,
): DateRangeValue {
  const day = toDay(anchor.getTime());

  if (view === "month") {
    return getPeriod("month", day);
  }

  const { visible } = getViewWindows(view, anchor, options);

  return {
    from: toDay(visible.start.getTime()),
    to: toDay(visible.end.getTime() - DAY_MILLISECONDS),
  };
}

/**
 * Whether a mode picks by a grid of cells rather than by days.
 */
export function isGridMode(mode: DatePickerMode): mode is GridMode {
  return mode !== "day" && mode !== "week";
}

/**
 * The modes a layout can show: none finer than the unit it draws.
 */
export function listOfferedModes(view: CalendarViewName): DatePickerMode[] {
  const minimum = MODE_RANKS[LAYOUT_UNITS[view] ?? "day"];
  const modes: DatePickerMode[] = [];

  for (const option of DATE_PICKER_MODES) {
    if (MODE_RANKS[option.id] >= minimum) {
      modes.push(option.id);
    }
  }

  return modes;
}

/**
 * The cells of the month, quarter, half-year or year grid at a cursor: the year, or the first year of twelve.
 */
export function listPeriodCells(mode: GridMode, cursor: number): PeriodCell[] {
  const cells: PeriodCell[] = [];

  if (mode === "year") {
    for (let year = cursor; year < cursor + 12; year += 1) {
      cells.push({
        label: String(year),
        range: getPeriod("year", `${year}-01-01`),
      });
    }

    return cells;
  }

  for (let month = 0; month < 12; month += MODE_MONTHS[mode]) {
    const first = `${cursor}-${String(month + 1).padStart(2, "0")}-01`;

    cells.push({
      label: describeCell(mode, month),
      range: getPeriod(mode, first),
    });
  }

  return cells;
}

/**
 * The weeks, Sunday to Saturday, that touch the month a cursor opens: one chip each.
 */
export function listWeekCells(cursor: string): PeriodCell[] {
  const last = getPeriod("month", cursor).to;
  const cells: PeriodCell[] = [];
  let week = getPeriod("week", cursor);

  while (week.from <= last) {
    cells.push({ label: formatWeekLabel(week), range: week });
    week = getPeriod("week", addCalendarDays(week.from, 7));
  }

  return cells;
}

/**
 * The mode a layout keeps: the one asked for, or the smallest it offers.
 */
export function resolveMode(
  mode: DatePickerMode,
  view: CalendarViewName,
): DatePickerMode {
  const offered = listOfferedModes(view);

  return offered.includes(mode) ? mode : (offered[0] ?? "day");
}

/**
 * Where the arrows move a grid's cursor: a year, or twelve.
 */
export function shiftGridCursor(
  mode: GridMode,
  cursor: number,
  direction: -1 | 1,
): number {
  return cursor + direction * (mode === "year" ? 12 : 1);
}

/**
 * Where the arrows move the week grid's cursor: a month.
 */
export function shiftMonthCursor(cursor: string, direction: -1 | 1): string {
  return getPeriod("month", cursor, direction).from;
}

/**
 * A `YYYY-MM-DD` day as the picker's calendar draws it, at local midnight.
 */
export function toLocalDate(day: string): Date {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);

  return new Date(year, month - 1, date);
}

/**
 * The `YYYY-MM-DD` day of a date the picker's calendar handed back.
 */
export function toLocalDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * The link's window for a range: the table's days, the timeline's fitting scale, or the first day.
 */
export function toWindowSearch(
  view: CalendarViewName,
  range: DateRangeValue,
): DateWindowSearch {
  if (view === "table" || isMetricView(view)) {
    return {
      date: range.from,
      days: Math.min(MAXIMUM_AGENDA_DAYS, countRangeDays(range)),
    };
  }

  if (view === "timeline") {
    return { date: range.from, scale: fitScale(range) };
  }

  return { date: range.from };
}

/**
 * What a cell of the grid says: a month's name, a quarter or half-year's number, a year.
 */
function describeCell(mode: GridMode, month: number): string {
  if (mode === "month") {
    return MONTH_LABELS[month] ?? "";
  }

  return `${mode === "quarter" ? "Q" : "H"}${month / MODE_MONTHS[mode] + 1}`;
}

/**
 * The smallest timeline scale whose span, opened on a range's first day, holds it all.
 */
function fitScale(range: DateRangeValue): TimelineScale {
  const anchor = parseCalendarDate(range.from, new Date());

  for (const scale of TIMELINE_SCALES) {
    const { visible } = getViewWindows("timeline", anchor, { scale });

    if (visible.end.getTime() > toUtc(range.to)) {
      return scale;
    }
  }

  return "year";
}

/**
 * The days from the first of a span's months to the day before the month after the last.
 */
function getMonthSpan(
  day: string,
  months: number,
  offset: number,
): DateRangeValue {
  const [year = 0, month = 1] = day.split("-").map(Number);
  const index = year * 12 + month - 1;
  const first = index - (index % months) + offset * months;
  const after = first + months;

  return {
    from: toDay(Date.UTC(Math.floor(first / 12), first % 12, 1)),
    to: toDay(Date.UTC(Math.floor(after / 12), after % 12, 0)),
  };
}

/**
 * A UTC instant as its `YYYY-MM-DD` day.
 */
function toDay(instant: number): string {
  return new Date(instant).toISOString().slice(0, "YYYY-MM-DD".length);
}

/**
 * A `YYYY-MM-DD` day as a UTC midnight.
 */
function toUtc(day: string): number {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);

  return Date.UTC(year, month - 1, date);
}
