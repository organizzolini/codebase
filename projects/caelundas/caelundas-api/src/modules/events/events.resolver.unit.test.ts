import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CalendarView } from "./calendar-view.entities";
import { EventFilterCombinator } from "./event-filter-combinator.entities";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";

import type { CalendarEventEntity } from "./calendar-event.entities";
import type { EventFacetEntity } from "./event-facet.entities";
import type { ResolvedEventFilterCollection } from "./event-filter-collections.types";
import type { EventsDatasetEntity } from "./events.entities";

const describeDataset = vi.fn<() => Promise<EventsDatasetEntity | null>>();
const findFilterCollections =
  vi.fn<() => Promise<ResolvedEventFilterCollection[]>>();
const findFacets =
  vi.fn<(...parameters: unknown[]) => Promise<EventFacetEntity[]>>();
const findCalendarWindows = vi.fn<(...parameters: unknown[]) => unknown>();
const findEvents =
  vi.fn<(...parameters: unknown[]) => Promise<CalendarEventEntity[]>>();

describe(EventsResolver, () => {
  let resolver: EventsResolver;

  beforeAll(async () => {
    ({ instance: resolver } = await buildTestingModule(EventsResolver, {
      providers: [
        {
          provide: EventsService,
          useValue: {
            describeDataset,
            findCalendarWindows,
            findEvents,
            findFacets,
            findFilterCollections,
          },
        },
      ],
    }));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(EventsResolver, {
      providers: [{ provide: EventsService, useValue: {} }],
    });

    expect(instance).toBeInstanceOf(EventsResolver);
  });

  it("answers the dataset query with the service's description", async () => {
    expect.hasAssertions();

    const dataset = {
      count: 2,
      end: new Date("2026-03-02T00:00:00Z"),
      start: new Date("2026-03-01T00:00:00Z"),
      timezone: "America/New_York",
    };

    describeDataset.mockResolvedValueOnce(dataset);

    await expect(resolver.dataset()).resolves.toBe(dataset);
  });

  it("answers the events query with the events in the window", async () => {
    expect.hasAssertions();

    findEvents.mockResolvedValueOnce([]);

    await expect(
      resolver.events({
        end: new Date("2026-03-02T00:00:00Z"),
        start: new Date("2026-03-01T00:00:00Z"),
      }),
    ).resolves.toStrictEqual([]);
    expect(findEvents).toHaveBeenCalledWith(
      {
        end: new Date("2026-03-02T00:00:00Z"),
        start: new Date("2026-03-01T00:00:00Z"),
      },
      null,
      [],
    );
  });

  it("validates the filter the events and facets queries take before the service sees it", async () => {
    expect.hasAssertions();

    const window = {
      end: new Date("2026-03-02T00:00:00Z"),
      start: new Date("2026-03-01T00:00:00Z"),
    };
    const filter = {
      combinator: EventFilterCombinator.OR,
      rules: [{ operator: "contains", path: ["text"], values: ["mars"] }],
    };
    const parsed = {
      combinator: "or",
      groups: [],
      rules: [
        {
          negated: false,
          operator: "contains",
          path: ["text"],
          values: ["mars"],
        },
      ],
    };

    findEvents.mockResolvedValue([]);
    findFacets.mockResolvedValue([]);

    await resolver.events(window, filter);
    await resolver.facets(window, filter);

    expect(findEvents).toHaveBeenLastCalledWith(window, parsed, []);
    expect(findFacets).toHaveBeenLastCalledWith(window, parsed);
    await expect(
      resolver.events(window, {
        combinator: "xor" as EventFilterCombinator,
      }),
    ).rejects.toThrow(/combinator/u);
  });

  it("validates the grouping the events query takes and puts the color level last", async () => {
    expect.hasAssertions();

    const window = {
      end: new Date("2026-03-02T00:00:00Z"),
      start: new Date("2026-03-01T00:00:00Z"),
    };

    findEvents.mockResolvedValue([]);

    await resolver.events(window, null, {
      colorBy: { field: "hour" },
      levels: [{ field: "year" }, { depth: 2, field: "tag:root", tags: ["a"] }],
    });

    expect(findEvents).toHaveBeenLastCalledWith(window, null, [
      { field: "year", tags: [] },
      { depth: 2, field: "tag:root", tags: ["a"] },
      { field: "hour", tags: [] },
    ]);
    await expect(
      resolver.events(window, null, {
        levels: [
          { field: "year" },
          { field: "month" },
          { field: "day" },
          { field: "hour" },
        ],
      }),
    ).rejects.toThrow(/too_big/u);
  });

  it("answers the calendar windows query with the service's windows", () => {
    expect.hasAssertions();

    const windows = { columnMinutes: null, visible: {}, window: {} };

    findCalendarWindows.mockReturnValueOnce(windows);

    expect(
      resolver.calendarWindows({
        anchor: "2026-10-22T12:00:00.000Z",
        view: CalendarView.WEEK,
      }),
    ).toBe(windows);
    expect(findCalendarWindows).toHaveBeenCalledWith({
      anchor: "2026-10-22T12:00:00.000Z",
      view: "week",
    });
  });

  it("answers the facets query over the window, or over everything without one", async () => {
    expect.hasAssertions();

    const window = {
      end: new Date("2026-03-02T00:00:00Z"),
      start: new Date("2026-03-01T00:00:00Z"),
    };

    findFacets.mockResolvedValue([]);

    await expect(resolver.facets(window)).resolves.toStrictEqual([]);
    expect(findFacets).toHaveBeenLastCalledWith(window, null);

    await resolver.facets();

    expect(findFacets).toHaveBeenLastCalledWith(undefined, null);
  });

  it("serves the filter collections the service resolved", async () => {
    expect.hasAssertions();

    const collection: ResolvedEventFilterCollection = {
      description: "Everything notable",
      filter: { combinator: EventFilterCombinator.AND, groups: [], rules: [] },
      id: "highlights",
      name: "Highlights",
    };
    const other = { ...collection, id: "major-aspects" };

    findFilterCollections.mockResolvedValue([other, collection]);

    await expect(resolver.filterCollections()).resolves.toStrictEqual([
      other,
      collection,
    ]);
    await expect(resolver.defaultFilterCollection()).resolves.toBe(collection);
  });

  it("answers no default collection when the data cannot serve it", async () => {
    expect.hasAssertions();

    findFilterCollections.mockResolvedValue([]);

    await expect(resolver.defaultFilterCollection()).resolves.toBeNull();
  });
});
