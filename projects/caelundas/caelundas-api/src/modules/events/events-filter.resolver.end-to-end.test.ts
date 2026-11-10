import { afterAll, beforeAll, describe, expect, it } from "vitest";

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

/** A filter variable, as a client writes it. */
interface GroupVariable {
  combinator: "AND" | "OR";
  groups?: GroupVariable[];
  rules?: RuleVariable[];
}

/** One rule of a filter variable, as a client writes it. */
interface RuleVariable {
  negated?: boolean;
  operator: string;
  path: string[];
  values?: string[];
}

const MARS_RETROGRADE = "Mars Retrograde";
const MOON_CONJUNCT_MARS = "Moon Conjunct Mars";
const SUN_ENTERS_ARIES = "Sun Enters Aries";
const EQUINOX_WATCH = "Equinox Watch";

/** The whole fixture, in the order the events query answers it. */
const EVERYTHING = [
  MARS_RETROGRADE,
  MOON_CONJUNCT_MARS,
  SUN_ENTERS_ARIES,
  EQUINOX_WATCH,
];

/**
 * Sends the events and facets queries with filters over HTTP to the events
 * module on a Postgres built by the real migration, covering every filter the
 * calendar offers against a seeded fixture.
 */
describe("events filtering end-to-end suite", () => {
  let application: EventsApplication;
  let tags: FilterTags;

  /** The summaries of the events a filter keeps, earliest first. */
  async function keep(filter: GroupVariable | null): Promise<string[]> {
    const body = await application.query(
      `query Events($period: PeriodInput!, $filter: EventFilterGroupInput) {
        events(period: $period, filter: $filter) { summary }
      }`,
      {
        filter,
        period: {
          end: "2026-04-01T00:00:00.000Z",
          start: "2026-03-01T00:00:00.000Z",
        },
      },
    );

    expect(body.errors).toBeUndefined();

    const { events } = (body.data ?? {}) as {
      events: { summary: string }[];
    };

    return events.map(({ summary }) => summary);
  }

  /** Keeps the events one rule holds for. */
  async function keepWhere(rule: RuleVariable): Promise<string[]> {
    return keep({ combinator: "AND", rules: [rule] });
  }

  /** A rule on a tag root's field. */
  function tagRule(
    root: Tag,
    operator: string,
    values: string[],
    negated?: boolean,
  ): RuleVariable {
    return {
      ...(negated === undefined ? {} : { negated }),
      operator,
      path: [`tag:${root.id}`],
      values,
    };
  }

  beforeAll(async () => {
    application = await startEventsApplication();
    await seedEvents(application.database);
    tags = await seedFilterTags(application.database);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("keeps every event without a filter, with an empty one, or with only unfinished rules", async () => {
    expect.hasAssertions();

    await expect(keep(null)).resolves.toStrictEqual(EVERYTHING);
    await expect(
      keep({ combinator: "AND", groups: [], rules: [] }),
    ).resolves.toStrictEqual(EVERYTHING);
    await expect(
      keep({
        combinator: "OR",
        groups: [
          {
            combinator: "AND",
            rules: [{ operator: "contains", path: ["text"] }],
          },
        ],
        rules: [
          { operator: "unheard_of", path: ["weekday"], values: ["1"] },
          { operator: "is_any_of", path: ["nonsense"], values: ["1"] },
          { operator: "is_any_of", path: ["weekday"], values: ["12"] },
        ],
      }),
    ).resolves.toStrictEqual(EVERYTHING);
  });

  it("leaves an unfinished rule out of the condition it sits beside", async () => {
    expect.hasAssertions();

    await expect(
      keep({
        combinator: "AND",
        rules: [
          { operator: "contains", path: ["text"], values: [" "] },
          { operator: "contains", path: ["text"], values: ["equinox"] },
        ],
      }),
    ).resolves.toStrictEqual([EQUINOX_WATCH]);
  });

  describe("tags", () => {
    it("matches an event carrying the tag or any tag beneath it", async () => {
      expect.hasAssertions();

      const { aspect, major, type } = tags;

      await expect(
        keepWhere(tagRule(type, "is_any_of", [major.id])),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS]);
      await expect(
        keepWhere(tagRule(type, "is_any_of", [aspect.id])),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS]);
      await expect(
        keepWhere(tagRule(type, "is_any_of", [type.id])),
      ).resolves.toStrictEqual([
        MARS_RETROGRADE,
        MOON_CONJUNCT_MARS,
        SUN_ENTERS_ARIES,
      ]);
    });

    it("requires all of the picked tags for has_all_of", async () => {
      expect.hasAssertions();

      const { major, moon, signIngress, type } = tags;

      await expect(
        keepWhere(tagRule(type, "has_all_of", [major.id, moon.id])),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS]);
      await expect(
        keepWhere(tagRule(type, "has_all_of", [major.id, signIngress.id])),
      ).resolves.toStrictEqual([]);
    });

    it("drops the events carrying any picked tag for is_none_of, as a negated is_any_of does", async () => {
      expect.hasAssertions();

      const { moon, type } = tags;
      const withoutTheMoon = [MARS_RETROGRADE, SUN_ENTERS_ARIES, EQUINOX_WATCH];

      await expect(
        keepWhere(tagRule(type, "is_none_of", [moon.id])),
      ).resolves.toStrictEqual(withoutTheMoon);
      await expect(
        keepWhere(tagRule(type, "is_any_of", [moon.id], true)),
      ).resolves.toStrictEqual(withoutTheMoon);
    });

    it("treats a pick that is no tag as a tag the data lacks", async () => {
      expect.hasAssertions();

      const { type } = tags;

      await expect(
        keepWhere(tagRule(type, "is_any_of", ["no-such-tag"])),
      ).resolves.toStrictEqual([]);
      await expect(
        keepWhere(tagRule(type, "is_none_of", ["no-such-tag"])),
      ).resolves.toStrictEqual(EVERYTHING);
    });

    it("compares the numbers the tags beneath a root are named for", async () => {
      expect.hasAssertions();

      const { harmonic } = tags;

      await expect(
        keepWhere(tagRule(harmonic, "gte", ["6"])),
      ).resolves.toStrictEqual([SUN_ENTERS_ARIES, EQUINOX_WATCH]);
      await expect(
        keepWhere(tagRule(harmonic, "eq", ["2"])),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS]);
      await expect(
        keepWhere(tagRule(harmonic, "between", ["3", "8"])),
      ).resolves.toStrictEqual([EQUINOX_WATCH]);
      await expect(
        keepWhere(tagRule(harmonic, "neq", ["6"])),
      ).resolves.toStrictEqual([
        MARS_RETROGRADE,
        MOON_CONJUNCT_MARS,
        SUN_ENTERS_ARIES,
      ]);
      await expect(
        keepWhere(tagRule(harmonic, "not_between", ["2", "12"])),
      ).resolves.toStrictEqual([MARS_RETROGRADE]);
    });

    it("never reads the root's own name as a number", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere(tagRule(tags.harmonic, "lt", ["1"])),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("derived fields", () => {
    it("keeps the events overlapping a range of local days", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere({
          operator: "between",
          path: ["date"],
          values: ["2026-03-10", "2026-03-10"],
        }),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS]);
      await expect(
        keepWhere({
          operator: "between",
          path: ["date"],
          values: ["2026-03-04", "2026-03-04"],
        }),
      ).resolves.toStrictEqual([MARS_RETROGRADE]);
      await expect(
        keepWhere({
          operator: "between",
          path: ["date"],
          values: ["2026-03-21", "2026-03-21"],
        }),
      ).resolves.toStrictEqual([EQUINOX_WATCH]);
      await expect(
        keepWhere({
          operator: "not_between",
          path: ["date"],
          values: ["2026-03-04", "2026-03-19"],
        }),
      ).resolves.toStrictEqual([SUN_ENTERS_ARIES, EQUINOX_WATCH]);
    });

    it("keeps the events starting on picked weekdays in their own zone", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere({ operator: "is_any_of", path: ["weekday"], values: ["2"] }),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS]);
      await expect(
        keepWhere({ operator: "is_any_of", path: ["weekday"], values: ["5"] }),
      ).resolves.toStrictEqual([SUN_ENTERS_ARIES, EQUINOX_WATCH]);
      await expect(
        keepWhere({ operator: "is_none_of", path: ["weekday"], values: ["5"] }),
      ).resolves.toStrictEqual([MARS_RETROGRADE, MOON_CONJUNCT_MARS]);
    });

    it("keeps the events starting within a range or an ordering of local hours", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere({ operator: "between", path: ["hour"], values: ["8", "8"] }),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS]);
      await expect(
        keepWhere({ operator: "gt", path: ["hour"], values: ["20"] }),
      ).resolves.toStrictEqual([MARS_RETROGRADE, EQUINOX_WATCH]);
      await expect(
        keepWhere({
          operator: "not_between",
          path: ["hour"],
          values: ["0", "21"],
        }),
      ).resolves.toStrictEqual([MARS_RETROGRADE, EQUINOX_WATCH]);
    });

    it("keeps the events whose duration falls in a bucket", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere({
          operator: "is_any_of",
          path: ["duration"],
          values: ["instant"],
        }),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS, SUN_ENTERS_ARIES]);
      await expect(
        keepWhere({
          operator: "is_any_of",
          path: ["duration"],
          values: ["hours"],
        }),
      ).resolves.toStrictEqual([MARS_RETROGRADE, EQUINOX_WATCH]);
      await expect(
        keepWhere({
          operator: "is_none_of",
          path: ["duration"],
          values: ["instant"],
        }),
      ).resolves.toStrictEqual([MARS_RETROGRADE, EQUINOX_WATCH]);
      await expect(
        keepWhere({
          operator: "is_any_of",
          path: ["duration"],
          values: ["months"],
        }),
      ).resolves.toStrictEqual([]);
    });

    it("compares the duration in minutes", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere({
          operator: "gt",
          path: ["duration-minutes"],
          values: ["100"],
        }),
      ).resolves.toStrictEqual([EQUINOX_WATCH]);
      await expect(
        keepWhere({
          operator: "between",
          path: ["duration-minutes"],
          values: ["0", "90"],
        }),
      ).resolves.toStrictEqual([
        MARS_RETROGRADE,
        MOON_CONJUNCT_MARS,
        SUN_ENTERS_ARIES,
      ]);
      await expect(
        keepWhere({
          operator: "eq",
          path: ["duration-minutes"],
          values: ["0"],
        }),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS, SUN_ENTERS_ARIES]);
    });

    it("keeps instants or durations by temporality", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere({
          operator: "is_any_of",
          path: ["temporality"],
          values: ["Duration"],
        }),
      ).resolves.toStrictEqual([MARS_RETROGRADE, EQUINOX_WATCH]);
      await expect(
        keepWhere({
          operator: "is_none_of",
          path: ["temporality"],
          values: ["Duration"],
        }),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS, SUN_ENTERS_ARIES]);
    });

    it("searches the summary and the description, ignoring case, with wildcards taken literally", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere({
          operator: "contains",
          path: ["text"],
          values: ["EQUINOX"],
        }),
      ).resolves.toStrictEqual([EQUINOX_WATCH]);
      await expect(
        keepWhere({
          operator: "contains",
          path: ["text"],
          values: ["description"],
        }),
      ).resolves.toStrictEqual(EVERYTHING);
      await expect(
        keepWhere({ operator: "contains", path: ["text"], values: ["%"] }),
      ).resolves.toStrictEqual([]);
      await expect(
        keepWhere({
          operator: "not_contains",
          path: ["text"],
          values: ["mars"],
        }),
      ).resolves.toStrictEqual([SUN_ENTERS_ARIES, EQUINOX_WATCH]);
    });
  });

  describe("combinators", () => {
    it("nests groups, joining each under its own combinator", async () => {
      expect.hasAssertions();

      await expect(
        keep({
          combinator: "OR",
          groups: [
            {
              combinator: "AND",
              rules: [
                { operator: "is_any_of", path: ["weekday"], values: ["2"] },
                { operator: "between", path: ["hour"], values: ["8", "8"] },
              ],
            },
          ],
          rules: [
            { operator: "contains", path: ["text"], values: ["equinox"] },
          ],
        }),
      ).resolves.toStrictEqual([MOON_CONJUNCT_MARS, EQUINOX_WATCH]);
    });

    it("flips a negated rule", async () => {
      expect.hasAssertions();

      await expect(
        keepWhere({
          negated: true,
          operator: "contains",
          path: ["text"],
          values: ["mars"],
        }),
      ).resolves.toStrictEqual([SUN_ENTERS_ARIES, EQUINOX_WATCH]);
    });
  });

  describe("boundary", () => {
    it("rejects a combinator the schema does not know", async () => {
      expect.hasAssertions();

      const body = await application.query(
        `query($period: PeriodInput!, $filter: EventFilterGroupInput) {
          events(period: $period, filter: $filter) { summary }
        }`,
        {
          filter: { combinator: "XOR" },
          period: {
            end: "2026-04-01T00:00:00.000Z",
            start: "2026-03-01T00:00:00.000Z",
          },
        },
      );

      expect(body.errors?.at(0)?.message).toMatch(/EventFilterCombinator/u);
    });

    it("rejects a rule with no operator", async () => {
      expect.hasAssertions();

      const body = await application.query(
        `query($period: PeriodInput!, $filter: EventFilterGroupInput) {
          events(period: $period, filter: $filter) { summary }
        }`,
        {
          filter: { combinator: "AND", rules: [{ path: ["text"] }] },
          period: {
            end: "2026-04-01T00:00:00.000Z",
            start: "2026-03-01T00:00:00.000Z",
          },
        },
      );

      expect(body.errors?.at(0)?.message).toMatch(/operator/u);
    });
  });

  describe("facets", () => {
    const FACETS = `
      query Facets($filter: EventFilterGroupInput) {
        facets(filter: $filter) { name values { name count } }
      }
    `;

    /** The counts of every tag a filtered facets query answers, by name. */
    async function count(
      filter: GroupVariable | null,
    ): Promise<Record<string, number>> {
      const body = await application.query(FACETS, { filter });

      expect(body.errors).toBeUndefined();

      const { facets } = (body.data ?? {}) as {
        facets: { values: { count: number; name: string }[] }[];
      };

      return Object.fromEntries(
        facets.flatMap(({ values }) =>
          values.map((value) => [value.name, value.count]),
        ),
      );
    }

    it("counts the events the filter keeps", async () => {
      expect.hasAssertions();

      const everything = await count(null);
      const tuesdays = await count({
        combinator: "AND",
        rules: [{ operator: "is_any_of", path: ["weekday"], values: ["2"] }],
      });

      expect(everything).toMatchObject({ Conjunct: 2, Mars: 1, Moon: 1 });
      expect(tuesdays).toMatchObject({ Conjunct: 2, Mars: 0, Moon: 1 });
    });
  });

  describe("presets", () => {
    const PRESETS = `
      query Presets {
        presets {
          id
          name
          description
          filter {
            combinator
            rules { path operator values negated }
            groups {
              combinator
              rules { path operator values negated }
              groups { combinator }
            }
          }
        }
        defaultPreset { id }
      }
    `;

    /** Asks for the presets and the default among them. */
    async function askPresets(): Promise<{
      defaultPreset: null | { id: string };
      presets: {
        filter: Record<string, unknown>;
        id: string;
      }[];
    }> {
      const body = await application.query(PRESETS);

      expect(body.errors).toBeUndefined();

      return body.data as never;
    }

    it("serves the presets the tags of the data can name, in menu order", async () => {
      expect.hasAssertions();

      const { presets } = await askPresets();

      expect(presets.map(({ id }) => id)).toStrictEqual([
        "highlights",
        "major-aspects",
        "aspects-without-the-moon",
        "planet-sign-events",
        "planetary-cycles",
      ]);
    });

    it("names the data's tags in a preset, leaving out those it lacks", async () => {
      expect.hasAssertions();

      const { presets } = await askPresets();
      const highlights = presets.find(({ id }) => id === "highlights");

      expect(highlights?.filter).toStrictEqual({
        combinator: "OR",
        groups: [
          {
            combinator: "AND",
            groups: [],
            rules: [
              {
                negated: false,
                operator: "is_any_of",
                path: [`tag:${tags.type.id}`],
                values: [tags.major.id, tags.signIngress.id],
              },
              {
                negated: false,
                operator: "is_none_of",
                path: [`tag:${tags.planet.id}`],
                values: [tags.moon.id],
              },
            ],
          },
        ],
        rules: [
          {
            negated: false,
            operator: "is_any_of",
            path: [`tag:${tags.type.id}`],
            values: [tags.direction.id],
          },
        ],
      });
    });

    it("leaves out a preset none of whose tags exist", async () => {
      expect.hasAssertions();

      const { presets } = await askPresets();
      const ids = presets.map(({ id }) => id);

      expect(ids).not.toContain("aspect-patterns");
      expect(ids).not.toContain("daily-cycles");
    });

    it("opens on the default preset, which filters the events when sent back", async () => {
      expect.hasAssertions();

      const { defaultPreset, presets } = await askPresets();

      expect(defaultPreset).toStrictEqual({ id: "highlights" });

      const filter = presets.find(({ id }) => id === "highlights")?.filter;

      await expect(
        keep(structuredClone(filter) as unknown as GroupVariable),
      ).resolves.toStrictEqual([MARS_RETROGRADE, SUN_ENTERS_ARIES]);
    });
  });
});
