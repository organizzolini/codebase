import { z } from "zod";

import type {
  TimelineScale as ApiTimelineScale,
  CalendarWindow,
} from "../../graphql/generated/operations";
import type { CalendarViewName, TimelineScale } from "./calendar-views.types";

// ♟️ Constants

/**
 * Where the Caelundas API serves GraphQL when `VITE_CAELUNDAS_API_URL` is not
 * set, the port its `CAELUNDAS_API_PORT` defaults to.
 */
export const DEFAULT_CAELUNDAS_API_URL = "http://localhost:6173/graphql";

/**
 * Validates the envelope of a GraphQL response: the data it answers with, and
 * the errors it reports instead of, or beside, it.
 */
export const responseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

/**
 * The API's name for each view the link names.
 */
export const API_VIEWS: Readonly<Record<CalendarViewName, CalendarWindow>> = {
  agenda: "AGENDA",
  day: "DAY",
  month: "MONTH",
  "three-day": "THREE_DAY",
  timeline: "TIMELINE",
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
