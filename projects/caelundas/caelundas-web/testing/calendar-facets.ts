import { findFacets } from "../src/components/events-calendar/events-api.utilities";

import { type CalendarApiOptions, serveCalendarApi } from "./calendar-api";

import type { EventFacet } from "../src/components/events-calendar/events-database.types";

/**
 * The facets the mocked API answers for the whole dataset, from the fixture
 * unless a test hands it other tags or events, read through the same client
 * the calendar reads them with.
 */
export async function findFixtureFacets(
  options: CalendarApiOptions = {},
): Promise<EventFacet[]> {
  serveCalendarApi(options);

  return findFacets();
}
