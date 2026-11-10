import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import { EventFilterCalendarFieldsService } from "./filters/event-filter-calendar-fields.service";
import { EventFilterCombinator } from "./filters/event-filter-combinator.entities";
import { EventFilterNumbersService } from "./filters/event-filter-numbers.service";
import { EventFilterParametersService } from "./filters/event-filter-parameters.service";
import { EventFilterValuesService } from "./filters/event-filter-values.service";
import { EventFilterService } from "./filters/event-filter.service";
import { EventGroupingService } from "./grouping/event-grouping.service";
import { CalendarWindow } from "./windows/calendar-window.entities";

import type { CalendarEventEntity } from "./calendar-event.entities";
import type { EventFacetEntity } from "./event-facet.entities";
import type { EventsDatasetEntity } from "./events.entities";
import type { ResolvedPreset } from "./presets/presets.types";

const describeDataset = vi.fn<() => Promise<EventsDatasetEntity | null>>();
const findPresets = vi.fn<() => Promise<ResolvedPreset[]>>();
const findFacets =
  vi.fn<(...parameters: unknown[]) => Promise<EventFacetEntity[]>>();
const findWindows = vi.fn<(...parameters: unknown[]) => unknown>();
const findEvents =
  vi.fn<(...parameters: unknown[]) => Promise<CalendarEventEntity[]>>();

describe(EventsResolver, () => {
  let resolver: EventsResolver;

  beforeAll(async () => {
    ({ instance: resolver } = await buildTestingModule(EventsResolver, {
      providers: [
        EventFilterCalendarFieldsService,
        EventFilterNumbersService,
        EventFilterParametersService,
        EventFilterService,
        EventFilterValuesService,
        EventGroupingService,
        {
          provide: EventsService,
          useValue: {
            describeDataset,
            findEvents,
            findFacets,
            findPresets,
            findWindows,
          },
        },
      ],
    }));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(EventsResolver, {
      providers: [
        EventFilterCalendarFieldsService,
        EventFilterNumbersService,
        EventFilterParametersService,
        EventFilterService,
        EventFilterValuesService,
        EventGroupingService,
        { provide: EventsService, useValue: {} },
      ],
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

  it("answers the events query with the events in the period", async () => {
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

    const period = {
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

    await resolver.events(period, filter);
    await resolver.facets(period, filter);

    expect(findEvents).toHaveBeenLastCalledWith(period, parsed, []);
    expect(findFacets).toHaveBeenLastCalledWith(period, parsed);
    await expect(
      resolver.events(period, {
        combinator: "xor" as EventFilterCombinator,
      }),
    ).rejects.toThrow(/combinator/u);
  });

  it("validates the grouping the events query takes and puts the color level last", async () => {
    expect.hasAssertions();

    const period = {
      end: new Date("2026-03-02T00:00:00Z"),
      start: new Date("2026-03-01T00:00:00Z"),
    };

    findEvents.mockResolvedValue([]);

    await resolver.events(period, null, {
      colorBy: { field: "hour" },
      levels: [{ field: "year" }, { depth: 2, field: "tag:root", tags: ["a"] }],
    });

    expect(findEvents).toHaveBeenLastCalledWith(period, null, [
      { field: "year", tags: [] },
      { depth: 2, field: "tag:root", tags: ["a"] },
      { field: "hour", tags: [] },
    ]);
    await expect(
      resolver.events(period, null, {
        levels: [
          { field: "year" },
          { field: "month" },
          { field: "day" },
          { field: "hour" },
        ],
      }),
    ).rejects.toThrow(/too_big/u);
  });

  it("answers the windows query with the service's windows", () => {
    expect.hasAssertions();

    const windows = { columnMinutes: null, read: {}, visible: {} };

    findWindows.mockReturnValueOnce(windows);

    expect(
      resolver.windows({
        anchor: "2026-10-22T12:00:00.000Z",
        window: CalendarWindow.WEEK,
      }),
    ).toBe(windows);
    expect(findWindows).toHaveBeenCalledWith({
      anchor: "2026-10-22T12:00:00.000Z",
      window: "week",
    });
  });

  it("answers the facets query over the period, or over everything without one", async () => {
    expect.hasAssertions();

    const period = {
      end: new Date("2026-03-02T00:00:00Z"),
      start: new Date("2026-03-01T00:00:00Z"),
    };

    findFacets.mockResolvedValue([]);

    await expect(resolver.facets(period)).resolves.toStrictEqual([]);
    expect(findFacets).toHaveBeenLastCalledWith(period, null);

    await resolver.facets();

    expect(findFacets).toHaveBeenLastCalledWith(undefined, null);
  });

  it("serves the presets the service resolved", async () => {
    expect.hasAssertions();

    const preset: ResolvedPreset = {
      description: "Everything notable",
      filter: { combinator: EventFilterCombinator.AND, groups: [], rules: [] },
      id: "highlights",
      name: "Highlights",
    };
    const other = { ...preset, id: "major-aspects" };

    findPresets.mockResolvedValue([other, preset]);

    await expect(resolver.presets()).resolves.toStrictEqual([other, preset]);
    await expect(resolver.defaultPreset()).resolves.toBe(preset);
  });

  it("answers no default preset when the data cannot serve it", async () => {
    expect.hasAssertions();

    findPresets.mockResolvedValue([]);

    await expect(resolver.defaultPreset()).resolves.toBeNull();
  });
});
