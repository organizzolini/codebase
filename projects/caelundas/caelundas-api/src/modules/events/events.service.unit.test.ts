import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { EventsService } from "./events.service";
import { EventFilterService } from "./modules/filtering/event-filter.service";
import { EventFilterCalendarFieldsService } from "./modules/filtering/modules/query-building/event-filter-calendar-fields.service";
import { EventFilterParametersService } from "./modules/filtering/modules/query-building/event-filter-parameters.service";
import { EventFilterNumbersService } from "./modules/filtering/modules/values/event-filter-numbers.service";
import { EventFilterValuesService } from "./modules/filtering/modules/values/event-filter-values.service";
import { EventGroupingService } from "./modules/grouping/event-grouping.service";
import { PresetsService } from "./modules/presets/presets.service";
import { CalendarWindow } from "./modules/windows/calendar-window.entities";
import { TimelineScale } from "./modules/windows/timeline-scale.entities";
import { WindowsService } from "./modules/windows/windows.service";

import type { EntityManager } from "typeorm";

const query = vi.fn<EntityManager["query"]>();
const transaction = vi.fn(
  async (run: (manager: { query: typeof query }) => Promise<unknown>) =>
    run({ query }),
);

describe(EventsService, () => {
  let service: EventsService;

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(EventsService, {
      providers: [
        EventFilterCalendarFieldsService,
        EventFilterNumbersService,
        EventFilterParametersService,
        EventFilterService,
        EventFilterValuesService,
        EventGroupingService,
        PresetsService,
        WindowsService,
        { provide: getEntityManagerToken(), useValue: { query, transaction } },
      ],
    }));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(EventsService, {
      providers: [
        EventFilterCalendarFieldsService,
        EventFilterNumbersService,
        EventFilterParametersService,
        EventFilterService,
        EventFilterValuesService,
        EventGroupingService,
        PresetsService,
        WindowsService,
        { provide: getEntityManagerToken(), useValue: { query } },
      ],
    });

    expect(instance).toBeInstanceOf(EventsService);
  });

  it("runs the statement with its parameters and parses each row", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([{ count: "3" }, { count: "4" }]);

    await expect(
      service.select("select 1", [7], z.object({ count: z.coerce.number() })),
    ).resolves.toStrictEqual([{ count: 3 }, { count: 4 }]);
    expect(query).toHaveBeenCalledWith("select 1", [7]);
  });

  it("works out the windows a view and a timeline scale read", () => {
    expect.hasAssertions();

    expect(
      service.findWindows({
        anchor: "2026-10-22T12:00:00.000Z",
        scale: TimelineScale.YEAR,
        window: CalendarWindow.TIMELINE,
      }).visible,
    ).toStrictEqual({
      end: new Date("2027-01-01T00:00:00.000Z"),
      start: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(
      service.findWindows({ anchor: new Date("2026-10-22T12:00:00Z") })
        .columnMinutes,
    ).toBeNull();
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

  it("finds the events in a period, binding its end then its start", async () => {
    expect.hasAssertions();

    const start = new Date("2026-03-05T03:30:00Z");
    const end = new Date("2026-03-05T05:00:00Z");

    query.mockResolvedValueOnce([
      {
        duration_minutes: 90,
        end,
        id: "event-1",
        name: "Mars Retrograde",
        note: "Mars stations retrograde",
        start,
        start_local_day: "2026-03-04",
        start_local_hour: 22,
        tags: [
          {
            depth: 2,
            id: "tag-1",
            name: "Retrograde",
            path: "Planet / Mars / Retrograde",
            slug: "retrograde",
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
        durationMinutes: 90,
        end,
        groups: [],
        id: "event-1",
        name: "Mars Retrograde",
        note: "Mars stations retrograde",
        start,
        startLocalDay: "2026-03-04",
        startLocalHour: 22,
        tags: [
          {
            depth: 2,
            id: "tag-1",
            name: "Retrograde",
            path: "Planet / Mars / Retrograde",
            slug: "retrograde",
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

  it("writes the period as ISO 8601 text in UTC for the query", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([]);

    await service.findEvents({
      end: "2026-03-05T03:30:00-05:00",
      start: new Date("2026-03-05T03:30:00Z"),
    });

    expect(query).toHaveBeenLastCalledWith(expect.any(String), [
      "2026-03-05T08:30:00.000Z",
      "2026-03-05T03:30:00.000Z",
    ]);
  });

  it("applies a compiled filter to the events, binding it after the period", async () => {
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

  it("reads each level's group keys with the event, binding them after the filter", async () => {
    expect.hasAssertions();

    const day = new Date("2026-03-05T03:30:00Z");

    query.mockResolvedValueOnce([
      {
        duration_minutes: 90,
        end: day,
        group_0: [{ key: "2026", label: null, path: null }],
        group_1: [],
        id: "event-1",
        name: "Mars Retrograde",
        note: "Mars stations retrograde",
        start: day,
        start_local_day: "2026-03-04",
        start_local_hour: 22,
        tags: [],
        timezone: "America/New_York",
      },
    ]);

    const events = await service.findEvents(
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
      {
        grouping: [
          { field: "year", tags: [] },
          { field: "tag:0199b1a0-0000-7000-8000-000000000002", tags: [] },
        ],
      },
    );

    expect(events.at(0)?.groups).toStrictEqual([
      [{ key: "2026", label: null, path: null, rank: null }],
      [],
    ]);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining("as group_1"),
      [
        "2026-03-06T00:00:00.000Z",
        "2026-03-05T00:00:00.000Z",
        "30",
        "0199b1a0-0000-7000-8000-000000000002",
        1,
      ],
    );
  });

  it("applies a compiled filter to the facets, with or without a period", async () => {
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

  it("gathers the tags beneath each root into its facet, counting over the period", async () => {
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
      slug: name.toLowerCase(),
      tag_rank: [root_id, ...path_below_root.split(" / ").filter(Boolean)]
        .map((level) => `00000:${level}`)
        .join(" / "),
    });

    query.mockResolvedValueOnce([
      row("planet", "Planet", "0", "planet", "", "0"),
      {
        ...row("mars", "Mars", "1", "planet", "Mars", "2"),
        is_filterable: false,
        is_sortable: false,
      },
      {
        ...row(
          "retrograde",
          "Retrograde",
          "2",
          "planet",
          "Mars / Retrograde",
          "1",
        ),
        icon: "rotate-ccw",
        note: "Moving backward.",
        parent_path: "planet / Mars",
      },
    ]);

    await expect(
      service.findFacets({
        end: new Date("2026-03-06T00:00:00Z"),
        start: new Date("2026-03-05T00:00:00Z"),
      }),
    ).resolves.toStrictEqual([
      {
        icon: null,
        id: "planet",
        isFilterable: true,
        isGroupable: true,
        isSelectable: true,
        isSortable: true,
        name: "Planet",
        note: null,
        slug: "planet",
        values: [
          {
            alsoUnder: [],
            count: 2,
            depth: 1,
            icon: null,
            id: "mars",
            isFilterable: false,
            isGroupable: true,
            isSelectable: true,
            isSortable: false,
            name: "Mars",
            note: null,
            path: "Mars",
            slug: "mars",
          },
          {
            alsoUnder: [],
            count: 1,
            depth: 2,
            icon: "rotate-ccw",
            id: "retrograde",
            isFilterable: true,
            isGroupable: true,
            isSelectable: true,
            isSortable: true,
            name: "Retrograde",
            note: "Moving backward.",
            path: "Mars / Retrograde",
            slug: "retrograde",
          },
        ],
      },
    ]);
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [
      "2026-03-06T00:00:00.000Z",
      "2026-03-05T00:00:00.000Z",
    ]);
  });

  it("orders a facet's tags alphanumerically, so Harmonic 2 comes before Harmonic 10", async () => {
    expect.hasAssertions();

    const row = (
      id: string,
      depth: string,
      path_below_root: string,
    ): Record<string, string> => ({
      count: "1",
      depth,
      id,
      name: path_below_root,
      path_below_root,
      root_id: "harmonic",
      slug: path_below_root.toLowerCase().replaceAll(" ", "-"),
      tag_rank: ["harmonic", ...path_below_root.split(" / ").filter(Boolean)]
        .map((level) => `00000:${level}`)
        .join(" / "),
    });

    query.mockResolvedValueOnce([
      row("harmonic", "0", ""),
      row("h10", "1", "Harmonic 10"),
      row("h2", "1", "Harmonic 2"),
      row("h1", "1", "Harmonic 1"),
    ]);

    const [facet] = await service.findFacets();

    expect(facet?.values.map((value) => value.path)).toStrictEqual([
      "Harmonic 1",
      "Harmonic 2",
      "Harmonic 10",
    ]);
  });

  it("orders siblings by their rank before their names, under each parent", async () => {
    expect.hasAssertions();

    const row = (
      id: string,
      name: string,
      rank: number,
      parent: string,
      path: string,
    ): Record<string, number | string> => ({
      count: "1",
      depth: path.split(" / ").length,
      id,
      name,
      path_below_root: path,
      rank,
      root_id: "sign",
      slug: name.toLowerCase(),
      tag_rank: [
        "00000:Sign",
        ...(parent === "aries" ? ["00001:Aries"] : []),
        `0000${String(rank)}:${name}`,
      ].join(" / "),
    });

    query.mockResolvedValueOnce([
      {
        count: "0",
        depth: "0",
        id: "sign",
        name: "Sign",
        path_below_root: "",
        root_id: "sign",
        slug: "sign",
        tag_rank: "00000:Sign",
      },
      row("taurus", "Taurus", 2, "sign", "Taurus"),
      row("aries", "Aries", 1, "sign", "Aries"),
      row("b", "B", 2, "aries", "Aries / B"),
      row("a", "A", 1, "aries", "Aries / A"),
    ]);

    const [facet] = await service.findFacets();

    expect(facet?.values.map((value) => value.path)).toStrictEqual([
      "Aries",
      "Aries / A",
      "Aries / B",
      "Taurus",
    ]);
  });

  it("lists a tag with two parents once a path, each naming where else it sits", async () => {
    expect.hasAssertions();

    const row = (
      id: string,
      depth: string,
      path: string,
      parentPath: null | string,
      rank: string,
    ): Record<string, null | string> => ({
      count: "4",
      depth,
      id,
      name: path.split(" / ").at(-1) ?? "Body",
      parent_id:
        parentPath === null ? null : (parentPath.split(" / ").at(-1) ?? null),
      parent_path: parentPath,
      path_below_root: path,
      root_id: "body",
      slug: "x",
      tag_rank: rank,
    });

    query.mockResolvedValueOnce([
      row("body", "0", "", null, "00000:Body"),
      row("planet", "1", "Planet", "Body", "00000:Body / 00002:Planet"),
      row(
        "venus",
        "2",
        "Planet / Venus",
        "Body / Planet",
        "00000:Body / 00002:Planet / 00001:Venus",
      ),
      row("benefic", "1", "Benefic", "Body", "00000:Body / 00003:Benefic"),
      row(
        "venus",
        "2",
        "Benefic / Venus",
        "Body / Benefic",
        "00000:Body / 00003:Benefic / 00002:Venus",
      ),
    ]);

    const [facet] = await service.findFacets();

    expect(
      facet?.values.map(({ alsoUnder, id, path }) => [id, path, alsoUnder]),
    ).toStrictEqual([
      ["planet", "Planet", []],
      ["venus", "Planet / Venus", ["Body / Benefic"]],
      ["benefic", "Benefic", []],
      ["venus", "Benefic / Venus", ["Body / Planet"]],
    ]);
  });

  it("counts over every event when no period is given", async () => {
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

  it("resolves the presets against the tags of the whole dataset", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([
      {
        count: "0",
        depth: "0",
        id: "planetary",
        name: "Planetary",
        path_below_root: "",
        root_id: "planetary",
        slug: "planetary",
        tag_rank: "00000:Planetary",
      },
      {
        count: "3",
        depth: "1",
        id: "direction",
        name: "Direction",
        path_below_root: "Direction",
        root_id: "planetary",
        slug: "direction",
        tag_rank: "00000:Planetary / 00000:Direction",
      },
    ]);

    const presets = await service.findPresets();

    expect(presets.map(({ id }) => id)).toStrictEqual([
      "highlights",
      "planetary-cycles",
    ]);
    expect(query).toHaveBeenLastCalledWith(expect.any(String), [null, null]);
  });
});
