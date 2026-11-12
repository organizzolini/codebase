import { findFacets } from "../src/components/events-calendar/events-api.utilities";

import { type CalendarApiOptions, serveCalendarApi } from "./calendar-api";

import type { EventFacet } from "../src/components/events-calendar/calendar-records.types";

/**
 * The facets the mocked API answers for the dataset, from the fixture unless a test hands others.
 */
export async function findFixtureFacets(
  options: CalendarApiOptions = {},
): Promise<EventFacet[]> {
  serveCalendarApi(options);

  return findFacets();
}
