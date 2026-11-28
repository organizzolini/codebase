import { findFacets } from "../../src/components/calendar-display/events-calendar/components/events-api/events-api.utilities";

import { type CalendarApiOptions, serveCalendarApi } from "./calendar-api";

import type { EventFacet } from "../../src/components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

/**
 * The facets the mocked API answers for the dataset, from the fixture unless a test hands others.
 */
export async function findFixtureFacets(
  options: CalendarApiOptions = {},
): Promise<EventFacet[]> {
  serveCalendarApi(options);

  return findFacets();
}
