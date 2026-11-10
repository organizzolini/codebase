import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { serveGraphqlApi } from "../../../testing/graphql-api";
import {
  mockDatasetQuery,
  mockEventsQuery,
  mockFacetsQuery,
  mockNightSkyQuery,
  mockPresetsQuery,
  mockWindowsQuery,
} from "../../graphql/generated/mocks";
import {
  DatasetDocument,
  EventsDocument,
  FacetsDocument,
  NightSkyDocument,
  PresetsDocument,
  WindowsDocument,
} from "../../graphql/generated/operations";

import {
  describeDataset,
  findEvents,
  findFacets,
  findPresets,
  findViewWindows,
  queryApi,
} from "./events-api.utilities";

const period = { end: "2026-02-01T00:00:00Z", start: "2026-01-01T00:00:00Z" };

describe("events api", () => {
  it("reads the dataset", async () => {
    expect.hasAssertions();

    const dataset = {
      count: 2,
      end: period.end,
      start: period.start,
      timezone: "UTC",
    };
    serveGraphqlApi(
      mockDatasetQuery(() => HttpResponse.json({ data: { dataset } })),
    );

    await expect(queryApi(DatasetDocument, {})).resolves.toStrictEqual({
      dataset,
    });
  });

  it("reads the events of a period with a filter and a grouping", async () => {
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
      period,
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

    await expect(queryApi(FacetsDocument, { period })).resolves.toStrictEqual({
      facets: [],
    });
  });

  it("reads the presets", async () => {
    expect.hasAssertions();

    const data = { defaultPreset: null, presets: [] };
    serveGraphqlApi(mockPresetsQuery(() => HttpResponse.json({ data })));

    await expect(queryApi(PresetsDocument, {})).resolves.toStrictEqual(data);
  });

  it("reads the windows", async () => {
    expect.hasAssertions();

    const windows = { columnMinutes: null, read: period, visible: period };
    serveGraphqlApi(
      mockWindowsQuery(() => HttpResponse.json({ data: { windows } })),
    );

    await expect(
      queryApi(WindowsDocument, {
        anchor: period.start,
        window: "MONTH",
      }),
    ).resolves.toStrictEqual({ windows });
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
              end: period.end,
              start: period.start,
              timezone: "UTC",
            },
          },
        }),
      ),
    );

    await expect(describeDataset()).resolves.toStrictEqual({
      count: 2,
      end: new Date(period.end),
      start: new Date(period.start),
      timezone: "UTC",
    });

    serveGraphqlApi(
      mockDatasetQuery(() => HttpResponse.json({ data: { dataset: null } })),
    );

    await expect(describeDataset()).resolves.toBeNull();
  });

  it("asks for a period's events with the filter and grouping, and reads their instants as dates", async () => {
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
                end: period.start,
                groups: [[{ key: "k", label: "L", path: null }]],
                id: "e1",
                location: null,
                start: period.start,
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
      period: { end: new Date(period.end), start: new Date(period.start) },
    });

    expect(received).toStrictEqual({
      filter: { combinator: "AND", rules: [] },
      grouping: { levels: [{ field: "month" }] },
      period: {
        end: "2026-02-01T00:00:00.000Z",
        start: "2026-01-01T00:00:00.000Z",
      },
    });
    expect(event?.start).toStrictEqual(new Date(period.start));
    expect(event?.groups).toStrictEqual([
      [{ key: "k", label: "L", path: null }],
    ]);
  });

  it("reads the facets over a period, or over every event without one", async () => {
    expect.hasAssertions();

    const periods: unknown[] = [];
    serveGraphqlApi(
      mockFacetsQuery(({ variables }) => {
        periods.push(variables.period);

        return HttpResponse.json({ data: { facets: [] } });
      }),
    );

    await findFacets({
      end: new Date(period.end),
      start: new Date(period.start),
    });
    await findFacets();

    expect(periods).toStrictEqual([
      { end: "2026-02-01T00:00:00.000Z", start: "2026-01-01T00:00:00.000Z" },
      null,
    ]);
  });

  it("reads the presets and the one the calendar opens on", async () => {
    expect.hasAssertions();

    const data = { defaultPreset: null, presets: [] };
    serveGraphqlApi(mockPresetsQuery(() => HttpResponse.json({ data })));

    await expect(findPresets()).resolves.toStrictEqual(data);
  });

  it("reads the windows of a view as dates, naming the view and scale as the API does", async () => {
    expect.hasAssertions();

    let received: unknown;
    serveGraphqlApi(
      mockWindowsQuery(({ variables }) => {
        received = variables;

        return HttpResponse.json({
          data: {
            windows: {
              columnMinutes: null,
              read: period,
              visible: period,
            },
          },
        });
      }),
    );

    await expect(
      findViewWindows({
        agendaDays: 7,
        anchor: new Date(period.start),
        scale: "quarter",
        view: "three-day",
      }),
    ).resolves.toStrictEqual({
      read: { end: new Date(period.end), start: new Date(period.start) },
      visible: { end: new Date(period.end), start: new Date(period.start) },
    });
    expect(received).toStrictEqual({
      agendaDays: 7,
      anchor: "2026-01-01T00:00:00.000Z",
      scale: "QUARTER",
      window: "THREE_DAY",
    });
  });
});
