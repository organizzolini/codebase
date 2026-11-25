import { describe, expect, it } from "vitest";

import {
  CACHED_METRIC_READS,
  METRICS_CACHE,
} from "./use-event-metrics.constants";
import {
  forgetEventMetrics,
  parseMetricsKey,
  rememberEventMetrics,
  toError,
  toZonedMidnight,
} from "./use-event-metrics.utilities";

import type { EventMetricsData } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";

const ANSWER: EventMetricsData = { groups: [], timezone: "UTC", total: [] };

function toKey(days = 30): string {
  return JSON.stringify({
    compareToPrevious: false,
    filter: null,
    grouping: null,
    metrics: ["EVENTS", "UNIQUE_NAMES"],
    period: {
      end: new Date(Date.UTC(2026, 2, 1 + days)).toISOString(),
      start: "2026-03-01T05:00:00.000Z",
    },
  });
}

describe("use-event-metrics utilities", () => {
  describe(toError, () => {
    it("keeps an error, and writes anything else as one", () => {
      const error = new Error("It broke");

      expect(toError(error)).toBe(error);
      expect(toError("It broke").message).toBe("It broke");
    });
  });

  describe(toZonedMidnight, () => {
    it.each([
      ["2026-03-01", "UTC", "2026-03-01T00:00:00.000Z"],
      ["2026-03-01", "America/New_York", "2026-03-01T05:00:00.000Z"],
      // The clocks spring forward on the 8th, after midnight.
      ["2026-03-08", "America/New_York", "2026-03-08T05:00:00.000Z"],
      ["2026-03-09", "America/New_York", "2026-03-09T04:00:00.000Z"],
      ["2026-03-01", "Asia/Tokyo", "2026-02-28T15:00:00.000Z"],
    ])("begins %s in %s at %s", (day, zone, instant) => {
      expect(toZonedMidnight(day, zone).toISOString()).toBe(instant);
    });
  });

  describe(forgetEventMetrics, () => {
    it("forgets the answer kept for a key", () => {
      rememberEventMetrics("kept", Promise.resolve(ANSWER));
      forgetEventMetrics("kept");

      expect(METRICS_CACHE.has("kept")).toBe(false);
    });
  });

  describe(parseMetricsKey, () => {
    it("reads the input a key was written from", () => {
      expect(parseMetricsKey(toKey(1))).toMatchObject({
        metrics: ["EVENTS", "UNIQUE_NAMES"],
      });
    });
  });

  describe(rememberEventMetrics, () => {
    it("keeps a read under its key, as the most recent", () => {
      const read = Promise.resolve(ANSWER);

      rememberEventMetrics("first", Promise.resolve(ANSWER));
      rememberEventMetrics("second", read);
      rememberEventMetrics("first", read);

      expect([...METRICS_CACHE.keys()]).toStrictEqual(["second", "first"]);
    });

    it("forgets a failed read, so a retry asks again", async () => {
      expect.hasAssertions();

      const failed = Promise.reject(new Error("The API is down"));

      rememberEventMetrics("failed", failed);

      await expect(failed).rejects.toThrow("The API is down");

      expect(METRICS_CACHE.has("failed")).toBe(false);
    });

    it("keeps only the most recent reads", () => {
      for (let day = 1; day <= CACHED_METRIC_READS + 1; day += 1) {
        rememberEventMetrics(toKey(day), Promise.resolve(ANSWER));
      }

      expect(METRICS_CACHE.size).toBe(CACHED_METRIC_READS);
      expect(METRICS_CACHE.has(toKey(1))).toBe(false);
    });
  });
});
