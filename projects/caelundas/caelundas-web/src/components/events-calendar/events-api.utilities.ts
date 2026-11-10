import { print } from "graphql";
import { z } from "zod";

import {
  DatasetDocument,
  EventsDocument,
  FacetsDocument,
  PresetsDocument,
  WindowsDocument,
} from "../../graphql/generated/operations";

import {
  API_SCALES,
  API_VIEWS,
  DEFAULT_CAELUNDAS_API_URL,
  responseSchema,
} from "./events-api.constants";

import type {
  EventsQuery,
  FacetsQuery,
  PresetsQuery,
} from "../../graphql/generated/operations";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDataset,
  Period,
} from "./calendar-records.types";
import type { ViewWindows, ViewWindowSearch } from "./calendar-window.types";
import type { EventsReadQuery } from "./events-api.types";
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
 * Reads the events that overlap a period and meet a filter, earliest first,
 * each with the group keys it falls in at every level of the grouping.
 */
export async function findEvents(
  query: EventsReadQuery,
): Promise<CalendarEventRecord[]> {
  const { events } = await queryApi(EventsDocument, {
    filter: query.filter ?? null,
    grouping: query.grouping ?? null,
    period: toPeriodInput(query.period),
  });

  const records: CalendarEventRecord[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const event of events) {
    records.push(toEventRecord(event));
  }

  return records;
}

/**
 * Reads every tag root and the tags beneath it, each counting the events
 * that overlap the period, or every event without one.
 */
export async function findFacets(period?: Period): Promise<EventFacet[]> {
  const { facets }: FacetsQuery = await queryApi(FacetsDocument, {
    period: period === undefined ? null : toPeriodInput(period),
  });

  return facets;
}

/**
 * Reads the named filters the calendar offers, resolved to the tags of the
 * data, and the one it opens on.
 */
export async function findPresets(): Promise<PresetsQuery> {
  return queryApi(PresetsDocument, {});
}

/**
 * Reads the days a view shows around a day, and the period of events to read
 * for them, a day wider either side.
 */
export async function findViewWindows(
  search: ViewWindowSearch,
): Promise<ViewWindows> {
  const { windows } = await queryApi(WindowsDocument, {
    agendaDays: search.agendaDays ?? null,
    anchor: search.anchor.toISOString(),
    scale: search.scale === undefined ? null : API_SCALES[search.scale],
    window: search.view === undefined ? null : API_VIEWS[search.view],
  });

  return {
    read: {
      end: new Date(windows.read.end),
      start: new Date(windows.read.start),
    },
    visible: {
      end: new Date(windows.visible.end),
      start: new Date(windows.visible.start),
    },
  };
}

/**
 * Runs one typed GraphQL operation against the Caelundas API, at the address
 * the `VITE_CAELUNDAS_API_URL` build variable gives or else the local
 * default, and returns its data, throwing the first error the API reports.
 */
export async function queryApi<
  TResult,
  TVariables extends Record<string, unknown>,
>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const environment: Record<string, unknown> = import.meta.env;
  const url = z
    .string()
    .min(1)
    .catch(DEFAULT_CAELUNDAS_API_URL)
    .parse(environment["VITE_CAELUNDAS_API_URL"]);
  const response = await fetch(url, {
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
 * Writes a period as the API's input.
 */
function toPeriodInput(period: Period): { end: string; start: string } {
  return {
    end: period.end.toISOString(),
    start: period.start.toISOString(),
  };
}
