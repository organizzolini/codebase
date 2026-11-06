import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";

import type { CalendarEventEntity } from "./calendar-event.entities";
import type { EventFacetEntity } from "./event-facet.entities";
import type { EventsDatasetEntity } from "./events.entities";

const describeDataset = vi.fn<() => Promise<EventsDatasetEntity | null>>();
const findFacets = vi.fn<() => Promise<EventFacetEntity[]>>();
const findEvents = vi.fn<() => Promise<CalendarEventEntity[]>>();

describe(EventsResolver, () => {
  let resolver: EventsResolver;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsResolver,
        {
          provide: EventsService,
          useValue: { describeDataset, findEvents, findFacets },
        },
      ],
    }).compile();

    resolver = await module.resolve(EventsResolver);
  });

  it("is defined", () => {
    expect(resolver).toBeDefined();
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
    expect(findEvents).toHaveBeenCalledWith({
      end: new Date("2026-03-02T00:00:00Z"),
      start: new Date("2026-03-01T00:00:00Z"),
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
    expect(findFacets).toHaveBeenLastCalledWith(window);

    await resolver.facets();

    expect(findFacets).toHaveBeenLastCalledWith(undefined);
  });
});
