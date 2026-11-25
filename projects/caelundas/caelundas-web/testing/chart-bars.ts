import type {
  ChartBar,
  ChartSegment,
} from "../src/components/calendar-display/calendar-charts/calendar-charts.types";

// A bar of two pieces, 4 and 2 events, for the charts' tests to draw, change and compare.

/**
 * A bar of 6 events in two pieces, which a test may change.
 */
export function createChartBar(overrides: Partial<ChartBar> = {}): ChartBar {
  return {
    ariaLabel: "Alpha: 6",
    change: undefined,
    color: "red",
    id: "/0:alpha",
    isExpandable: true,
    label: "Alpha",
    previous: null,
    previousText: "",
    segments: [
      createChartSegment(),
      createChartSegment({
        color: undefined,
        id: "two",
        label: "Two",
        share: "33%",
        text: "2",
        value: 2,
      }),
    ],
    target: "/0:alpha",
    text: "6",
    ...overrides,
  };
}

/**
 * A piece of a bar, with each field a test may leave as it is.
 */
export function createChartSegment(
  overrides: Partial<ChartSegment> = {},
): ChartSegment {
  return {
    color: "red",
    id: "one",
    isExpandable: false,
    label: "One",
    share: "67%",
    text: "4",
    value: 4,
    ...overrides,
  };
}
