import {
  SURFACE_CLASS_NAMES,
  VENDORED_SURFACE_CLASS_NAMES,
} from "./calendar-surfaces.constants";

// ♟️ Constants

// A phone's week scrolls sideways in the content area, with the hour column and day headers fixed.
// Page scroll mode lets that area own both axes; the "+N more" popover fits an event row.
export const OVERFLOW_CLASS_NAMES = { morePopover: "w-80" };

// The hour column stacks above the event chips, which the calendar stacks
// from 10 up, and below the sticky day headers at 20.

export const SCROLLING_WEEK_CLASS_NAMES = {
  timeGrid: "min-w-[48rem]",
  timeGridHeader: VENDORED_SURFACE_CLASS_NAMES.timeGridHeader,
  timeGutter: `${SURFACE_CLASS_NAMES.timeGutter} sticky start-0 z-[15]`,
};

// The calendar sets each event's native `title` unless this drops it, and
// the tooltip the events are wrapped in says more.
export const NO_NATIVE_TOOLTIP = {
  functions: { formatEventLabel: (): undefined => undefined },
};
