// A phone's week keeps each day wide enough to read, scrolling sideways in
// the content area while the hour column and the day headers stay put. Page
// scroll mode lets that area, rather than the grid's own inner scroller, do
// all the scrolling, so one element owns both axes.
// The "+N more" popover is widened to fit an event row's time and name.
export const OVERFLOW_CLASS_NAMES = { morePopover: "w-80" };

// The hour column stacks above the event chips, which the calendar stacks
// from 10 up, and below the sticky day headers at 20.

export const SCROLLING_WEEK_CLASS_NAMES = {
  timeGrid: "min-w-[48rem]",
  timeGutter: "bg-background sticky start-0 z-[15]",
};

// The calendar sets each event's native `title` unless this drops it, and
// the tooltip the events are wrapped in says more.
export const NO_NATIVE_TOOLTIP = {
  functions: { formatEventLabel: (): undefined => undefined },
};
