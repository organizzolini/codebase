import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { serveGraphqlApi } from "../../../testing/graphql-api";
import {
  mockCalendarWindowsQuery,
  mockDatasetQuery,
  mockEventsQuery,
  mockFacetsQuery,
  mockFilterCollectionsQuery,
  mockNightSkyQuery,
} from "../../graphql/generated/mocks";
import {
  CalendarWindowsDocument,
  DatasetDocument,
  EventsDocument,
  FacetsDocument,
  FilterCollectionsDocument,
  NightSkyDocument,
} from "../../graphql/generated/operations";

import {
  describeDataset,
  findEvents,
  findFacets,
  findFilterCollections,
  findViewWindows,
  queryApi,
} from "./events-api.utilities";

const window = { end: "2026-02-01T00:00:00Z", start: "2026-01-01T00:00:00Z" };

describe("events api", () => {
  it("reads the dataset", async () => {
    expect.hasAssertions();

    const dataset = {
      count: 2,
      end: window.end,
      start: window.start,
      timezone: "UTC",
    };
    serveGraphqlApi(
      mockDatasetQuery(() => HttpResponse.json({ data: { dataset } })),
    );

    await expect(queryApi(DatasetDocument, {})).resolves.toStrictEqual({
      dataset,
    });
  });

  it("reads the events of a window with a filter and a grouping", async () => {
    expect.hasAssertions();

    let received: unknown;
    serveGraphqlApi(
      mockEventsQuery(({ variables }) => {
        received = variables;
        return HttpResponse.json({ data: { events: [] } });
      }),
    );
    const variables = {
      filter: {
        combinator: "AND" as const,
        rules: [{ operator: "contains", path: ["text"], values: ["moon"] }],
      },
      grouping: { levels: [{ field: "month" }] },
      window,
    };

    await expect(queryApi(EventsDocument, variables)).resolves.toStrictEqual({
      events: [],
    });
    expect(received).toStrictEqual(variables);
  });

  it("reads the facets", async () => {
    expect.hasAssertions();

    serveGraphqlApi(
      mockFacetsQuery(() => HttpResponse.json({ data: { facets: [] } })),
    );

    await expect(queryApi(FacetsDocument, { window })).resolves.toStrictEqual({
      facets: [],
    });
  });

  it("reads the filter collections", async () => {
    expect.hasAssertions();

    const data = { defaultFilterCollection: null, filterCollections: [] };
    serveGraphqlApi(
      mockFilterCollectionsQuery(() => HttpResponse.json({ data })),
    );

    await expect(
      queryApi(FilterCollectionsDocument, {}),
    ).resolves.toStrictEqual(data);
  });

  it("reads the calendar windows", async () => {
    expect.hasAssertions();

    const calendarWindows = { columnMinutes: null, visible: window, window };
    serveGraphqlApi(
      mockCalendarWindowsQuery(() =>
        HttpResponse.json({ data: { calendarWindows } }),
      ),
    );

    await expect(
      queryApi(CalendarWindowsDocument, {
        anchor: window.start,
        view: "MONTH",
      }),
    ).resolves.toStrictEqual({ calendarWindows });
  });

  it("reads the night sky", async () => {
    expect.hasAssertions();

    const nightSky = {
      measurements: {
        bottomAltitudeDegrees: 0,
        fieldOfViewClamped: false,
        fieldOfViewLimitDegrees: 90,
        periodSeconds: 1,
        poleDistanceAboveScreen: 0,
        realTimeMultiple: 1,
        segmentsDrawn: 0,
        starsDrawn: 0,
        starsInCatalog: 0,
        svgLength: 0,
        topAltitudeDegrees: 90,
        verticalFieldOfViewDegrees: 90,
      },
      svg: "<svg />",
    };
    serveGraphqlApi(
      mockNightSkyQuery(() => HttpResponse.json({ data: { nightSky } })),
    );

    await expect(
      queryApi(NightSkyDocument, { input: { height: 1, width: 1 } }),
    ).resolves.toStrictEqual({ nightSky });
  });

  it("reads the dataset's span as dates, or nothing for no data", async () => {
    expect.hasAssertions();

    serveGraphqlApi(
      mockDatasetQuery(() =>
        HttpResponse.json({
          data: {
            dataset: {
              count: 2,
              end: window.end,
              start: window.start,
              timezone: "UTC",
            },
          },
        }),
      ),
    );

    await expect(describeDataset()).resolves.toStrictEqual({
      count: 2,
      end: new Date(window.end),
      start: new Date(window.start),
      timezone: "UTC",
    });

    serveGraphqlApi(
      mockDatasetQuery(() => HttpResponse.json({ data: { dataset: null } })),
    );

    await expect(describeDataset()).resolves.toBeNull();
  });

  it("asks for a window's events with the filter and grouping, and reads their instants as dates", async () => {
    expect.hasAssertions();

    let received: unknown;
    serveGraphqlApi(
      mockEventsQuery(({ variables }) => {
        received = variables;

        return HttpResponse.json({
          data: {
            events: [
              {
                color: null,
                description: "d",
                durationMinutes: 0,
                end: window.start,
                groups: [[{ key: "k", label: "L", path: null }]],
                id: "e1",
                location: null,
                start: window.start,
                startLocalDay: "2026-01-01",
                startLocalHour: 0,
                summary: "s",
                tags: [{ depth: 1, id: "t", name: "T", path: "R / T" }],
                timezone: "UTC",
              },
            ],
          },
        });
      }),
    );

    const [event] = await findEvents({
      filter: { combinator: "AND", rules: [] },
      grouping: { levels: [{ field: "month" }] },
      window: { end: new Date(window.end), start: new Date(window.start) },
    });

    expect(received).toStrictEqual({
      filter: { combinator: "AND", rules: [] },
      grouping: { levels: [{ field: "month" }] },
      window: {
        end: "2026-02-01T00:00:00.000Z",
        start: "2026-01-01T00:00:00.000Z",
      },
    });
    expect(event?.start).toStrictEqual(new Date(window.start));
    expect(event?.groups).toStrictEqual([
      [{ key: "k", label: "L", path: null }],
    ]);
  });

  it("reads the facets over a window, or over every event without one", async () => {
    expect.hasAssertions();

    const windows: unknown[] = [];
    serveGraphqlApi(
      mockFacetsQuery(({ variables }) => {
        windows.push(variables.window);

        return HttpResponse.json({ data: { facets: [] } });
      }),
    );

    await findFacets({
      end: new Date(window.end),
      start: new Date(window.start),
    });
    await findFacets();

    expect(windows).toStrictEqual([
      { end: "2026-02-01T00:00:00.000Z", start: "2026-01-01T00:00:00.000Z" },
      null,
    ]);
  });

  it("reads the collections and the one the calendar opens on", async () => {
    expect.hasAssertions();

    const data = { defaultFilterCollection: null, filterCollections: [] };
    serveGraphqlApi(
      mockFilterCollectionsQuery(() => HttpResponse.json({ data })),
    );

    await expect(findFilterCollections()).resolves.toStrictEqual(data);
  });

  it("reads the windows of a view as dates, naming the view and scale as the API does", async () => {
    expect.hasAssertions();

    let received: unknown;
    serveGraphqlApi(
      mockCalendarWindowsQuery(({ variables }) => {
        received = variables;

        return HttpResponse.json({
          data: {
            calendarWindows: {
              columnMinutes: null,
              visible: window,
              window,
            },
          },
        });
      }),
    );

    await expect(
      findViewWindows({
        agendaDays: 7,
        anchor: new Date(window.start),
        scale: "quarter",
        view: "three-day",
      }),
    ).resolves.toStrictEqual({
      visible: { end: new Date(window.end), start: new Date(window.start) },
      window: { end: new Date(window.end), start: new Date(window.start) },
    });
    expect(received).toStrictEqual({
      agendaDays: 7,
      anchor: "2026-01-01T00:00:00.000Z",
      scale: "QUARTER",
      view: "THREE_DAY",
    });
  });
});
