import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  CaelundasDatabaseService,
  CalendarEventTag,
} from "@codebase/caelundas-db";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedEvents,
  seedFilterTags,
  startEventsApplication,
} from "../../../testing/events-application";

import type {
  EventsApplication,
  FilterTags,
} from "../../../testing/events-application";
import type { Tag } from "@codebase/caelundas-db";

/** One group key as the events query returns it. */
interface GroupKey {
  key: string;
  label: null | string;
  path: null | string;
}

/** A grouping level variable, as a client writes it. */
interface LevelVariable {
  depth?: number;
  field: string;
  tags?: string[];
}

const MARS_RETROGRADE = "Mars Retrograde";
const MOON_CONJUNCT_MARS = "Moon Conjunct Mars";
const SUN_ENTERS_ARIES = "Sun Enters Aries";
const EQUINOX_WATCH = "Equinox Watch";

/**
 * Sends the events query with a grouping over HTTP to the events module on a
 * Postgres built by the real migration, reading each event's group keys from
 * a seeded fixture.
 */
describe("events grouping end-to-end suite", () => {
  let application: EventsApplication;
  let base: Record<string, Tag>;
  let tags: FilterTags;

  /** A tag the base fixture seeded, by name. */
  function tagOf(name: string): Tag {
    const tag = base[name];

    if (tag === undefined) {
      throw new Error(`The fixture seeds no tag ${name}`);
    }

    return tag;
  }

  /** The id of a tag the base fixture seeded. */
  function idOf(name: string): string {
    return tagOf(name).id;
  }

  /** The group keys of every event, by summary, one list per level. */
  async function group(
    grouping: LevelVariable[] | null,
    options: { colorBy?: LevelVariable; filter?: unknown } = {},
  ): Promise<Record<string, GroupKey[][]>> {
    const body = await application.query(
      `query Events(
        $window: EventsWindowInput!
        $filter: EventFilterGroupInput
        $grouping: EventGroupingInput
      ) {
        events(window: $window, filter: $filter, grouping: $grouping) {
          summary
          groups { key label path }
        }
      }`,
      {
        filter: options.filter ?? null,
        grouping:
          grouping === null
            ? null
            : { colorBy: options.colorBy ?? null, levels: grouping },
        window: {
          end: "2026-04-01T00:00:00.000Z",
          start: "2026-03-01T00:00:00.000Z",
        },
      },
    );

    expect(body.errors).toBeUndefined();

    const { events } = (body.data ?? {}) as {
      events: { groups: GroupKey[][]; summary: string }[];
    };

    return Object.fromEntries(
      events.map(({ groups, summary }) => [summary, groups]),
    );
  }

  /** The keys of each level, sorted, for comparing without the order. */
  function keysOf(levels: GroupKey[][] | undefined): string[][] {
    return (levels ?? []).map((keys) => keys.map(({ key }) => key).toSorted());
  }

  /** Reads one derived field of every event as its single key. */
  async function derive(field: string): Promise<Record<string, string>> {
    const grouped = await group([{ field }]);

    return Object.fromEntries(
      Object.entries(grouped).map(([summary, [keys]]) => [
        summary,
        keys?.at(0)?.key ?? "",
      ]),
    );
  }

  beforeAll(async () => {
    application = await startEventsApplication();
    base = await seedEvents(application.database);
    tags = await seedFilterTags(application.database);

    // Give Moon Conjunct Mars a second planet, so it falls under both.
    const [event] = await application.database.dataSource.query<
      [{ id: string }]
    >(`select id from calendar_events where "summary" = $1`, [
      MOON_CONJUNCT_MARS,
    ]);

    await application.database
      .repository(CalendarEventTag)
      .insert({ calendarEventId: event.id, tagId: idOf("mars") });
    await application.database.module
      .get(CaelundasDatabaseService)
      .refreshReadModel(application.database.dataSource.manager);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("returns no groups for a query that asks for none", async () => {
    expect.hasAssertions();

    const withoutGrouping = await group(null);
    const empty = await group([]);

    expect(Object.keys(withoutGrouping)).toHaveLength(4);
    expect(Object.values(withoutGrouping).every((g) => g.length === 0)).toBe(
      true,
    );
    expect(Object.values(empty).every((g) => g.length === 0)).toBe(true);
  });

  describe("derived fields", () => {
    it("reads the year, quarter and month in each event's own zone", async () => {
      expect.hasAssertions();

      await expect(derive("year")).resolves.toStrictEqual({
        [EQUINOX_WATCH]: "2026",
        [MARS_RETROGRADE]: "2026",
        [MOON_CONJUNCT_MARS]: "2026",
        [SUN_ENTERS_ARIES]: "2026",
      });
      await expect(derive("quarter")).resolves.toMatchObject({
        [MARS_RETROGRADE]: "2026-Q1",
      });
      await expect(derive("month")).resolves.toMatchObject({
        [MARS_RETROGRADE]: "2026-03",
      });
    });

    it("reads the day an event starts on where it was observed, not in UTC", async () => {
      expect.hasAssertions();

      // 03:30 UTC on the 5th is still the evening of the 4th in New York.
      await expect(derive("day")).resolves.toStrictEqual({
        [EQUINOX_WATCH]: "2026-03-20",
        [MARS_RETROGRADE]: "2026-03-04",
        [MOON_CONJUNCT_MARS]: "2026-03-10",
        [SUN_ENTERS_ARIES]: "2026-03-20",
      });
    });

    it("reads the Sunday a week starts on", async () => {
      expect.hasAssertions();

      await expect(derive("week")).resolves.toStrictEqual({
        [EQUINOX_WATCH]: "2026-03-15",
        [MARS_RETROGRADE]: "2026-03-01",
        [MOON_CONJUNCT_MARS]: "2026-03-08",
        [SUN_ENTERS_ARIES]: "2026-03-15",
      });
    });

    it("reads the weekday from Sunday as 0 and the hour as two digits", async () => {
      expect.hasAssertions();

      await expect(derive("weekday")).resolves.toStrictEqual({
        [EQUINOX_WATCH]: "5",
        [MARS_RETROGRADE]: "3",
        [MOON_CONJUNCT_MARS]: "2",
        [SUN_ENTERS_ARIES]: "5",
      });
      await expect(derive("hour")).resolves.toStrictEqual({
        [EQUINOX_WATCH]: "22",
        [MARS_RETROGRADE]: "22",
        [MOON_CONJUNCT_MARS]: "08",
        [SUN_ENTERS_ARIES]: "05",
      });
    });

    it("reads the duration bucket", async () => {
      expect.hasAssertions();

      await expect(derive("duration")).resolves.toStrictEqual({
        [EQUINOX_WATCH]: "hours",
        [MARS_RETROGRADE]: "hours",
        [MOON_CONJUNCT_MARS]: "instant",
        [SUN_ENTERS_ARIES]: "instant",
      });
    });

    it("answers each derived key with no label or path, which the client writes", async () => {
      expect.hasAssertions();

      const grouped = await group([{ field: "year" }]);

      expect(grouped[MARS_RETROGRADE]).toStrictEqual([
        [{ key: "2026", label: null, path: null }],
      ]);
    });
  });

  describe("tag roots", () => {
    it("groups by a root's children, an event with two planets under both", async () => {
      expect.hasAssertions();

      const { moon } = tags;
      const mars = tagOf("mars");
      const grouped = await group([{ field: `tag:${tags.planet.id}` }]);

      expect(keysOf(grouped[MOON_CONJUNCT_MARS])).toStrictEqual([
        [mars.id, moon.id].toSorted(),
      ]);
      expect(keysOf(grouped[MARS_RETROGRADE])).toStrictEqual([[mars.id]]);
    });

    it("names each tag and its path from the root down", async () => {
      expect.hasAssertions();

      const grouped = await group([{ field: `tag:${tags.planet.id}` }]);

      expect(grouped[MARS_RETROGRADE]).toStrictEqual([
        [{ key: idOf("mars"), label: "Mars", path: "Planet / Mars" }],
      ]);
    });

    it("counts each group by the distinct events under it", async () => {
      expect.hasAssertions();

      const grouped = await group([{ field: `tag:${tags.planet.id}` }]);
      const counts = new Map<string, Set<string>>();

      for (const [summary, [keys = []]] of Object.entries(grouped)) {
        for (const { label } of keys) {
          counts.set(
            label ?? "",
            (counts.get(label ?? "") ?? new Set()).add(summary),
          );
        }
      }

      expect(counts.get("Mars")).toStrictEqual(
        new Set([MARS_RETROGRADE, MOON_CONJUNCT_MARS]),
      );
      expect(counts.get("Moon")).toStrictEqual(new Set([MOON_CONJUNCT_MARS]));
    });

    it("gathers an event with no tag in the root under no group, for the client's last 'No …' group", async () => {
      expect.hasAssertions();

      const grouped = await group([{ field: `tag:${tags.planet.id}` }]);

      expect(grouped[SUN_ENTERS_ARIES]).toStrictEqual([[]]);
      expect(grouped[EQUINOX_WATCH]).toStrictEqual([[]]);
    });

    it("goes down to the depth asked for, a tag that ends above it standing for itself", async () => {
      expect.hasAssertions();

      const root = `tag:${tags.planet.id}`;
      const deeper = await group([{ depth: 2, field: root }]);
      const deepest = await group([{ depth: 5, field: root }]);

      expect(keysOf(deeper[MARS_RETROGRADE])).toStrictEqual([
        [idOf("retrograde")],
      ]);
      expect(keysOf(deeper[MOON_CONJUNCT_MARS])).toStrictEqual([
        [idOf("mars"), tags.moon.id].toSorted(),
      ]);
      expect(keysOf(deepest[MARS_RETROGRADE])).toStrictEqual([
        [idOf("retrograde")],
      ]);
    });

    it("groups by the picked tags, each finding everything beneath it", async () => {
      expect.hasAssertions();

      const mars = tagOf("mars");
      const grouped = await group([
        { field: `tag:${tags.planet.id}`, tags: [mars.id, tags.moon.id] },
      ]);

      expect(keysOf(grouped[MARS_RETROGRADE])).toStrictEqual([[mars.id]]);
      expect(keysOf(grouped[SUN_ENTERS_ARIES])).toStrictEqual([[]]);

      const planet = await group([
        { field: `tag:${tags.planet.id}`, tags: [tags.planet.id] },
      ]);

      expect(keysOf(planet[MARS_RETROGRADE])).toStrictEqual([[tags.planet.id]]);
    });

    it("treats a root or pick that is no tag as a tag the data lacks", async () => {
      expect.hasAssertions();

      const noRoot = await group([{ field: "tag:no-such-root" }]);
      const noPick = await group([
        { field: `tag:${tags.planet.id}`, tags: ["no-such-tag"] },
      ]);

      expect(Object.values(noRoot).every(([keys]) => keys?.length === 0)).toBe(
        true,
      );
      expect(Object.values(noPick).every(([keys]) => keys?.length === 0)).toBe(
        true,
      );
    });
  });

  describe("levels", () => {
    it("returns one list per level, in order, and the color level last", async () => {
      expect.hasAssertions();

      const grouped = await group(
        [{ field: `tag:${tags.planet.id}` }, { field: "month" }],
        { colorBy: { field: "hour" } },
      );

      expect(keysOf(grouped[MARS_RETROGRADE])).toStrictEqual([
        [idOf("mars")],
        ["2026-03"],
        ["22"],
      ]);
    });

    it("answers no keys for a field the calendar does not know", async () => {
      expect.hasAssertions();

      const grouped = await group([{ field: "nonsense" }, { field: "year" }]);

      expect(keysOf(grouped[MARS_RETROGRADE])).toStrictEqual([[], ["2026"]]);
    });

    it("reads the keys of the events a filter keeps, with the filter's parameters bound first", async () => {
      expect.hasAssertions();

      const grouped = await group(
        [{ field: `tag:${tags.planet.id}` }, { field: "weekday" }],
        {
          filter: {
            combinator: "AND",
            rules: [
              {
                operator: "is_any_of",
                path: [`tag:${tags.type.id}`],
                values: [tags.type.id],
              },
              { operator: "contains", path: ["text"], values: ["mars"] },
            ],
          },
        },
      );

      expect(Object.keys(grouped).toSorted()).toStrictEqual(
        [MARS_RETROGRADE, MOON_CONJUNCT_MARS].toSorted(),
      );
      expect(keysOf(grouped[MARS_RETROGRADE])[1]).toStrictEqual(["3"]);
    });

    it("refuses more than three levels of grouping, a color level aside", async () => {
      expect.hasAssertions();

      const body = await application.query(
        `query Events($window: EventsWindowInput!, $grouping: EventGroupingInput) {
          events(window: $window, grouping: $grouping) { id }
        }`,
        {
          grouping: {
            levels: ["year", "month", "day", "hour"].map((field) => ({
              field,
            })),
          },
          window: {
            end: "2026-04-01T00:00:00.000Z",
            start: "2026-03-01T00:00:00.000Z",
          },
        },
      );

      expect(body.errors?.at(0)?.message).toContain("too_big");
    });

    it("refuses a depth outside what a tag grouping may reach", async () => {
      expect.hasAssertions();

      const body = await application.query(
        `query Events($window: EventsWindowInput!, $grouping: EventGroupingInput) {
          events(window: $window, grouping: $grouping) { id }
        }`,
        {
          grouping: { levels: [{ depth: 99, field: `tag:${tags.planet.id}` }] },
          window: {
            end: "2026-04-01T00:00:00.000Z",
            start: "2026-03-01T00:00:00.000Z",
          },
        },
      );

      expect(body.errors?.at(0)?.message).toContain("too_big");
    });
  });
});
