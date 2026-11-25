import { z } from "zod";

import {
  CACHED_METRIC_READS,
  METRICS_CACHE,
  ZONE_FORMATS,
} from "./use-event-metrics.constants";

import type { EventMetricsData } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { EventMetricsInput } from "../../../../graphql/generated/operations";

// 🔏 Private Functions

/**
 * Forgets the answer kept for an input, so the next read asks the API again.
 */
export function forgetEventMetrics(key: string): void {
  METRICS_CACHE.delete(key);
}

// 🌎 Public Functions

/**
 * The API's input a cache key was written from.
 */
export function parseMetricsKey(key: string): EventMetricsInput {
  return z.custom<EventMetricsInput>().parse(JSON.parse(key));
}

/**
 * Keeps a read under its input key as the most recent, and drops the least recent past the limit; a failed read is forgotten.
 */
export function rememberEventMetrics(
  key: string,
  read: Promise<EventMetricsData>,
): void {
  // Set again at the back, so the least recently read goes first.
  METRICS_CACHE.delete(key);
  METRICS_CACHE.set(key, read);
  read.catch(() => {
    METRICS_CACHE.delete(key);
  });

  for (const oldest of METRICS_CACHE.keys()) {
    if (METRICS_CACHE.size <= CACHED_METRIC_READS) {
      break;
    }

    METRICS_CACHE.delete(oldest);
  }
}

/**
 * What a read failed with, as an error.
 */
export function toError(thrown: unknown): Error {
  return thrown instanceof Error ? thrown : new Error(String(thrown));
}

/**
 * The instant a calendar day, as `YYYY-MM-DD`, begins in a zone.
 */
export function toZonedMidnight(day: string, timeZone: string): Date {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  const midnight = Date.UTC(year, month - 1, date);
  // The offset is read at the guess, then again at the corrected instant, which settles a day on which the clocks change.
  const guess = midnight - readZoneOffset(midnight, timeZone);

  return new Date(midnight - readZoneOffset(guess, timeZone));
}

/**
 * How far a zone's clock is ahead of UTC at an instant, in milliseconds.
 */
function readZoneOffset(instant: number, timeZone: string): number {
  let format = ZONE_FORMATS.get(timeZone);

  if (format === undefined) {
    format = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
      minute: "numeric",
      month: "numeric",
      second: "numeric",
      timeZone,
      year: "numeric",
    });
    ZONE_FORMATS.set(timeZone, format);
  }

  const parts = new Map<string, number>();

  for (const part of format.formatToParts(instant)) {
    parts.set(part.type, Number(part.value));
  }

  const read = (type: string, fallback: number): number =>
    parts.get(type) ?? fallback;
  const clock = Date.UTC(
    read("year", 0),
    read("month", 1) - 1,
    read("day", 1),
    read("hour", 0),
    read("minute", 0),
    read("second", 0),
  );

  return clock - Math.floor(instant / 1000) * 1000;
}
