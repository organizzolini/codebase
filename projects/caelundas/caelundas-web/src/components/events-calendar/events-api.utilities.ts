import { print } from "graphql";
import { z } from "zod";

import {
  CalendarWindowsDocument,
  DatasetDocument,
  EventsDocument,
  FacetsDocument,
  FilterCollectionsDocument,
} from "../../graphql/generated/operations";

import {
  DEFAULT_CAELUNDAS_API_URL,
  responseSchema,
} from "./events-api.constants";

import type {
  CalendarWindowsQueryVariables,
  EventsQuery,
  FacetsQuery,
  FilterCollectionsQuery,
} from "../../graphql/generated/operations";
import type { ViewWindows } from "./calendar-window.types";
import type { EventsReadQuery } from "./events-api.types";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDataset,
  EventsWindow,
} from "./events-database.types";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

// 🌎 Public Functions

/**
 * Reads the span and zone of the whole dataset, or nothing when it is empty.
 */
export async function describeDataset(): Promise<EventsDataset | null> {
  const { dataset } = await queryApi(DatasetDocument, {});

  return dataset === null
    ? null
    : {
        count: dataset.count,
        end: new Date(dataset.end),
        start: new Date(dataset.start),
        timezone: dataset.timezone,
      };
}

/**
 * Reads the events that overlap a window and meet a filter, earliest first,
 * each with the group keys it falls in at every level of the grouping.
 */
export async function findEvents(
  query: EventsReadQuery,
): Promise<CalendarEventRecord[]> {
  const { events } = await queryApi(EventsDocument, {
    filter: query.filter ?? null,
    grouping: query.grouping ?? null,
    window: toWindowInput(query.window),
  });

  return events.map((event) => toEventRecord(event));
}

/**
 * Reads every tag root and the tags beneath it, each counting the events
 * that overlap the window, or every event without one.
 */
export async function findFacets(window?: EventsWindow): Promise<EventFacet[]> {
  const { facets }: FacetsQuery = await queryApi(FacetsDocument, {
    window: window === undefined ? null : toWindowInput(window),
  });

  return facets;
}

/**
 * Reads the named filters the calendar offers, resolved to the tags of the
 * data, and the one it opens on.
 */
export async function findFilterCollections(): Promise<FilterCollectionsQuery> {
  return queryApi(FilterCollectionsDocument, {});
}

/**
 * Reads the days a view shows around a day, and the window of events to read
 * for them.
 */
export async function findViewWindows(
  variables: CalendarWindowsQueryVariables,
): Promise<ViewWindows> {
  const { calendarWindows } = await queryApi(
    CalendarWindowsDocument,
    variables,
  );

  return {
    visible: toWindow(calendarWindows.visible),
    window: toWindow(calendarWindows.window),
  };
}

/**
 * Runs one typed GraphQL operation against the Caelundas API and returns its
 * data, throwing the first error the API reports.
 */
export async function queryApi<
  TResult,
  TVariables extends Record<string, unknown>,
>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const response = await fetch(readApiUrl(), {
    body: JSON.stringify({ query: print(document), variables }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const body = responseSchema.parse(await response.json());

  if (body.errors?.[0] !== undefined) {
    throw new Error(body.errors[0].message);
  }

  return z.custom<TResult>().parse(body.data);
}

/**
 * Reads the API's address from the `VITE_CAELUNDAS_API_URL` build variable,
 * falling back to the local default.
 */
export function readApiUrl(): string {
  const environment: Record<string, unknown> = import.meta.env;
  const configured = z
    .string()
    .min(1)
    .safeParse(environment["VITE_CAELUNDAS_API_URL"]);

  return configured.success ? configured.data : DEFAULT_CAELUNDAS_API_URL;
}

// 🔏 Private Functions

/**
 * Maps an event the API answered to the calendar's record, reading its
 * instants as dates.
 */
function toEventRecord(
  event: EventsQuery["events"][number],
): CalendarEventRecord {
  return {
    color: event.color,
    description: event.description,
    durationMinutes: event.durationMinutes,
    end: new Date(event.end),
    groups: event.groups,
    id: event.id,
    location: event.location,
    start: new Date(event.start),
    summary: event.summary,
    tags: event.tags,
    timezone: event.timezone,
  };
}

/**
 * Reads the API's pair of instants as a window.
 */
function toWindow(window: { end: string; start: string }): EventsWindow {
  return { end: new Date(window.end), start: new Date(window.start) };
}

/**
 * Writes a window as the API's input.
 */
function toWindowInput(window: EventsWindow): { end: string; start: string } {
  return {
    end: window.end.toISOString(),
    start: window.start.toISOString(),
  };
}
