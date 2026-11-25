import { describe, expect, it } from "vitest";

import { EventMetric } from "../inputs/event-metric.entities";

import {
  DISTINCT_MEASURE_SQL,
  MEASURE_SQL,
  METRIC_DEFINITIONS,
} from "./event-metrics-measures.constants";
import {
  evaluateMetrics,
  findMeasures,
  isDistinctMeasure,
} from "./event-metrics-measures.utilities";

import type { EventMeasureValues } from "./event-metrics-measures.types";

/** A group of three events, one an instant, over a ten-minute period. */
const MEASURES: EventMeasureValues = {
  clippedSeconds: 300,
  coveredClippedSeconds: 240,
  coveredSeconds: 360,
  days: 2,
  events: 3,
  firstStart: 1000,
  instants: 1,
  lastStart: 9000,
  longestSeconds: 240,
  medianSeconds: 150,
  names: 2,
  periodSeconds: 600,
  progressiveClippedSeconds: 120,
  progressiveCoveredClippedSeconds: 60,
  progressiveSeconds: 7200,
  seconds: 360,
  shortestSeconds: 60,
  spans: 2,
  tags: 5,
};

describe("event metrics measures", () => {
  describe(isDistinctMeasure, () => {
    it("tells the measures that count distinct values from the rest", () => {
      expect.hasAssertions();

      expect(isDistinctMeasure("tags")).toBe(true);
      expect(isDistinctMeasure("names")).toBe(false);
      expect(isDistinctMeasure("events")).toBe(false);
      expect(isDistinctMeasure("seconds")).toBe(false);
    });
  });

  describe(findMeasures, () => {
    it("lists the measures a metric reads, sorted", () => {
      expect.hasAssertions();

      expect(findMeasures([EventMetric.COVERED_PERCENT])).toStrictEqual([
        "coveredClippedSeconds",
        "periodSeconds",
      ]);
    });

    it("follows a metric to the metrics it reads, once", () => {
      expect.hasAssertions();

      expect(
        findMeasures([
          EventMetric.AVERAGE_DURATION_MINUTES,
          EventMetric.TOTAL_DURATION_MINUTES,
        ]),
      ).toStrictEqual(["seconds", "spans"]);
    });

    it("lists no measure for no metric", () => {
      expect.hasAssertions();

      expect(findMeasures([])).toStrictEqual([]);
    });
  });

  describe(evaluateMetrics, () => {
    it("computes each metric from the measures, in the order asked", () => {
      expect.hasAssertions();

      expect(
        evaluateMetrics(
          [
            EventMetric.EVENTS,
            EventMetric.INSTANTS,
            EventMetric.SPANS,
            EventMetric.DAYS_WITH_EVENTS,
            EventMetric.UNIQUE_NAMES,
            EventMetric.UNIQUE_TAGS,
            EventMetric.FIRST_START,
            EventMetric.LAST_START,
          ],
          MEASURES,
        ),
      ).toStrictEqual([3, 1, 2, 2, 2, 5, 1000, 9000]);
    });

    it("converts seconds to minutes and hours", () => {
      expect.hasAssertions();

      expect(
        evaluateMetrics(
          [
            EventMetric.TOTAL_DURATION_MINUTES,
            EventMetric.COVERED_MINUTES,
            EventMetric.LONGEST_DURATION_MINUTES,
            EventMetric.SHORTEST_DURATION_MINUTES,
            EventMetric.MEDIAN_DURATION_MINUTES,
            EventMetric.PROGRESSIVE_HOURS,
          ],
          MEASURES,
        ),
      ).toStrictEqual([6, 6, 4, 1, 2.5, 2]);
    });

    it("averages the minutes over the spans, a metric over metrics", () => {
      expect.hasAssertions();

      expect(
        evaluateMetrics([EventMetric.AVERAGE_DURATION_MINUTES], MEASURES),
      ).toStrictEqual([3]);
    });

    it("reads each share of the period as a percent", () => {
      expect.hasAssertions();

      expect(
        evaluateMetrics(
          [
            EventMetric.TOTAL_TIME_PERCENT,
            EventMetric.COVERED_PERCENT,
            EventMetric.PROGRESSIVE_TOTAL_PERCENT,
            EventMetric.PROGRESSIVE_COVERED_PERCENT,
          ],
          MEASURES,
        ),
      ).toStrictEqual([50, 40, 20, 10]);
    });

    it("reads nothing of a measure a statement did not select", () => {
      expect.hasAssertions();

      expect(
        evaluateMetrics(
          [EventMetric.EVENTS, EventMetric.LONGEST_DURATION_MINUTES],
          {},
        ),
      ).toStrictEqual([null, null]);
    });

    it("reads nothing where a ratio divides by none", () => {
      expect.hasAssertions();

      expect(
        evaluateMetrics(
          [
            EventMetric.AVERAGE_DURATION_MINUTES,
            EventMetric.TOTAL_TIME_PERCENT,
            EventMetric.MEDIAN_DURATION_MINUTES,
          ],
          { clippedSeconds: 5, periodSeconds: 0, seconds: 0, spans: 0 },
        ),
      ).toStrictEqual([null, null, null]);
    });

    it("keeps a measure that is none as none", () => {
      expect.hasAssertions();

      expect(
        evaluateMetrics([EventMetric.TOTAL_TIME_PERCENT], {
          clippedSeconds: null,
          periodSeconds: 60,
        }),
      ).toStrictEqual([null]);
    });
  });

  describe("the definitions", () => {
    it("define every metric over measures that have SQL or come apart", () => {
      expect.hasAssertions();

      for (const definition of Object.values(METRIC_DEFINITIONS)) {
        for (const measure of definition.measures) {
          expect(
            measure in MEASURE_SQL || measure in DISTINCT_MEASURE_SQL,
          ).toBe(true);
        }
      }

      expect(Object.keys(METRIC_DEFINITIONS)).toHaveLength(
        Object.values(EventMetric).length,
      );
    });
  });
});
