import { z } from "zod";

import type {
  TimelineScale as ApiTimelineScale,
  CalendarWindow,
} from "../../../../../graphql/generated/operations";
import type {
  CalendarViewName,
  TimelineScale,
} from "../calendar-views/calendar-views.types";

// ♟️ Constants

/**
 * The API's default GraphQL URL, when the build variable is unset.
 */
export const DEFAULT_CAELUNDAS_API_URL = "http://localhost:6173/graphql";

/**
 * Validates a GraphQL response envelope: data and errors.
 */
export const responseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

/**
 * The API's name for each view the link names.
 */
export const API_VIEWS: Readonly<Record<CalendarViewName, CalendarWindow>> = {
  // The metric layouts read the table's days.
  charts: "AGENDA",
  day: "DAY",
  month: "MONTH",
  table: "AGENDA",
  timeline: "TIMELINE",
  totals: "AGENDA",
  week: "WEEK",
};

/**
 * The API's name for each span the timeline shows.
 */
export const API_SCALES: Readonly<Record<TimelineScale, ApiTimelineScale>> = {
  day: "DAY",
  month: "MONTH",
  quarter: "QUARTER",
  week: "WEEK",
  year: "YEAR",
};
