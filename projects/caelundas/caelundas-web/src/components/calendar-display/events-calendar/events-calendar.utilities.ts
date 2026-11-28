import { getPickerRange } from "../../calendar-controls/calendar-date-picker/calendar-date-picker.utilities";

import {
  OVERFLOW_CLASS_NAMES,
  SCROLLING_WEEK_CLASS_NAMES,
} from "./events-calendar.constants";

import type { DateRangeValue } from "../../calendar-controls/calendar-date-picker/calendar-date-picker.types";
import type { CalendarToolbarProperties } from "../../calendar-controls/calendar-toolbar/calendar-toolbar";
import type { EventsDataset } from "./components/calendar-loader/calendar-records.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "./components/calendar-views/calendar-views.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * What the toolbar's date picker needs: the days shown now and where to apply a range; none without one.
 */
export function createDatePicker(
  context: Readonly<{
    agendaDays?: number | undefined;
    anchor: Date;
    onRangeChange?: ((range: DateRangeValue) => void) | undefined;
    scale: TimelineScale;
    timeZone: string;
    view: CalendarViewName;
  }>,
): CalendarToolbarProperties["datePicker"] {
  const { agendaDays, anchor, onRangeChange, scale, timeZone, view } = context;

  return onRangeChange === undefined
    ? undefined
    : {
        onApply: onRangeChange,
        range: getPickerRange(view, anchor, { agendaDays, scale }),
        timeZone,
        view,
      };
}

/**
 * How a view lays out: a phone's week scrolls sideways under a sticky hour column; every other view scrolls inside itself.
 */
export function getViewLayout(
  view: CalendarViewName,
  compact: boolean,
): {
  classNames: Record<string, string>;
  contentClassName: string | undefined;
  scrollMode: "contained" | "page";
} {
  return compact && view === "week"
    ? {
        classNames: SCROLLING_WEEK_CLASS_NAMES,
        contentClassName: "overflow-auto",
        scrollMode: "page",
      }
    : {
        classNames: OVERFLOW_CLASS_NAMES,
        contentClassName: undefined,
        scrollMode: "contained",
      };
}

/**
 * The zone the calendar renders times in: the one the data's events were
 * computed for, or the browser's own before any data is known.
 */
export function readTimeZone(dataset: EventsDataset | null): string {
  return dataset?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}
