import { Test } from "@nestjs/testing";
import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { EventsService } from "./events.service";

import type { EntityManager } from "typeorm";

const query = vi.fn<EntityManager["query"]>();

describe(EventsService, () => {
  let service: EventsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getEntityManagerToken(), useValue: { query } },
      ],
    }).compile();

    service = await module.resolve(EventsService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("runs the statement with its parameters and parses each row", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([{ count: "3" }, { count: "4" }]);

    await expect(
      service.select("select 1", [7], z.object({ count: z.coerce.number() })),
    ).resolves.toStrictEqual([{ count: 3 }, { count: 4 }]);
    expect(query).toHaveBeenCalledWith("select 1", [7]);
  });

  it("describes the dataset from its single row", async () => {
    expect.hasAssertions();

    const start = new Date("2026-03-01T00:00:00Z");
    const end = new Date("2026-03-02T00:00:00Z");

    query.mockResolvedValueOnce([
      { count: "2", end, start, timezone: "America/New_York" },
    ]);

    await expect(service.describeDataset()).resolves.toStrictEqual({
      count: 2,
      end,
      start,
      timezone: "America/New_York",
    });
  });

  it("describes an empty dataset as null", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([]);

    await expect(service.describeDataset()).resolves.toBeNull();
  });

  it("finds the events in a window, binding its end then its start", async () => {
    expect.hasAssertions();

    const start = new Date("2026-03-05T03:30:00Z");
    const end = new Date("2026-03-05T05:00:00Z");

    query.mockResolvedValueOnce([
      {
        color: null,
        description: "Mars stations retrograde",
        duration_minutes: 90,
        end,
        id: "event-1",
        location: null,
        start,
        start_local_day: "2026-03-04",
        start_local_hour: 22,
        summary: "Mars Retrograde",
        tags: [
          {
            depth: 2,
            id: "tag-1",
            name: "Retrograde",
            path: "Planet / Mars / Retrograde",
          },
        ],
        timezone: "America/New_York",
      },
    ]);

    await expect(
      service.findEvents({
        end: new Date("2026-03-06T00:00:00Z"),
        start: new Date("2026-03-05T00:00:00Z"),
      }),
    ).resolves.toStrictEqual([
      {
        color: null,
        description: "Mars stations retrograde",
        durationMinutes: 90,
        end,
        id: "event-1",
        location: null,
        start,
        startLocalDay: "2026-03-04",
        startLocalHour: 22,
        summary: "Mars Retrograde",
        tags: [
          {
            depth: 2,
            id: "tag-1",
            name: "Retrograde",
            path: "Planet / Mars / Retrograde",
          },
        ],
        timezone: "America/New_York",
      },
    ]);
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [
      "2026-03-06T00:00:00.000Z",
      "2026-03-05T00:00:00.000Z",
    ]);
  });

  it("applies a compiled filter to the events, binding it after the window", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([]);

    await service.findEvents(
      {
        end: new Date("2026-03-06T00:00:00Z"),
        start: new Date("2026-03-05T00:00:00Z"),
      },
      {
        combinator: "and",
        groups: [],
        rules: [
          {
            negated: false,
            operator: "gt",
            path: ["duration-minutes"],
            values: ["30"],
          },
        ],
      },
    );

    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining("and ((e.duration_minutes > $3::numeric))"),
      ["2026-03-06T00:00:00.000Z", "2026-03-05T00:00:00.000Z", "30"],
    );
  });

  it("applies a compiled filter to the facets, with or without a window", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([]);

    await service.findFacets(undefined, {
      combinator: "and",
      groups: [],
      rules: [
        {
          negated: false,
          operator: "is_any_of",
          path: ["weekday"],
          values: ["2"],
        },
      ],
    });

    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining("= any($3::integer[])"),
      [null, null, [2]],
    );
  });

  it("leaves the statement as it was when the filter compiles to nothing", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([]);

    await service.findFacets(undefined, {
      combinator: "and",
      groups: [],
      rules: [],
    });

    expect(query).toHaveBeenLastCalledWith(
      expect.not.stringContaining("{filter}"),
      [null, null],
    );
  });

  it("gathers the tags beneath each root into its facet, counting over the window", async () => {
    expect.hasAssertions();

    const row = (
      id: string,
      name: string,
      depth: string,
      root_id: string,
      path_below_root: string,
      count: string,
    ): Record<string, string> => ({
      count,
      depth,
      id,
      name,
      path_below_root,
      root_id,
    });

    query.mockResolvedValueOnce([
      row("planet", "Planet", "0", "planet", "", "0"),
      row("mars", "Mars", "1", "planet", "Mars", "2"),
      row("retrograde", "Retrograde", "2", "planet", "Mars / Retrograde", "1"),
    ]);

    await expect(
      service.findFacets({
        end: new Date("2026-03-06T00:00:00Z"),
        start: new Date("2026-03-05T00:00:00Z"),
      }),
    ).resolves.toStrictEqual([
      {
        id: "planet",
        name: "Planet",
        values: [
          { count: 2, depth: 1, id: "mars", name: "Mars", path: "Mars" },
          {
            count: 1,
            depth: 2,
            id: "retrograde",
            name: "Retrograde",
            path: "Mars / Retrograde",
          },
        ],
      },
    ]);
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [
      "2026-03-06T00:00:00.000Z",
      "2026-03-05T00:00:00.000Z",
    ]);
  });

  it("counts over every event when no window is given", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([]);

    await expect(service.findFacets()).resolves.toStrictEqual([]);
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [null, null]);
  });

  it("refuses a row that does not match the schema", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([{ count: "many" }]);

    await expect(
      service.select("select 1", [], z.object({ count: z.coerce.number() })),
    ).rejects.toThrow(z.ZodError);
  });
});
