import { describe, expect, it } from "vitest";

import {
  fieldRule,
  filterGroup,
  findMatchingEventIds,
} from "../../../testing/event-filters";

import { compileDerivedRule } from "./event-filter-derived";

// An event observed in a zone no time zone database knows.
const UNREADABLE_ZONE_SQL = `
  insert into calendar_events (id, created_at, updated_at, description, "end", latitude, longitude, "start", "summary", timezone) values
    ('event-unreadable-zone', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Somewhere else', '2026-03-10T12:00:00.000Z', 0, 0, '2026-03-10T12:00:00.000Z', 'Elsewhere', 'Mars/Olympus_Mons');
`;

// The seed's events are in New York. Venus enters Aries at 03:12 UTC on
// Thursday 26 March, which is 23:12 on Wednesday 25 March there, so a
// filter read in UTC would place it on the wrong day and hour.

/**
 * The seeded events one rule keeps.
 */
async function matching(
  field: string,
  operator: string,
  value: Parameters<typeof fieldRule>[2],
): Promise<string[]> {
  return findMatchingEventIds(
    filterGroup("and", fieldRule(field, operator, value)),
  );
}

describe(compileDerivedRule, () => {
  it("keeps the events overlapping a date range in the observer's zone", async () => {
    await expect(
      matching("date", "between", ["2026-03-25", "2026-03-25"]),
    ).resolves.toStrictEqual(["event-venus-ingress-aries"]);
    await expect(
      matching("date", "between", ["2026-03-01", "2026-03-05"]),
    ).resolves.toStrictEqual([
      "event-mars-conjunct-venus",
      "event-mercury-retrograde",
    ]);
  });

  it("drops the events overlapping a date range for is not between", async () => {
    await expect(
      matching("date", "not_between", ["2026-02-01", "2026-03-31"]),
    ).resolves.toStrictEqual([
      "event-mars-square-saturn",
      "event-sun-ingress-cancer",
    ]);
  });

  it("keeps the events starting on the chosen weekdays", async () => {
    await expect(
      matching("weekday", "is_any_of", ["3"]),
    ).resolves.toStrictEqual([
      "event-mars-conjunct-venus",
      "event-venus-ingress-aries",
    ]);
    await expect(
      matching("weekday", "is_none_of", ["3", "5"]),
    ).resolves.toStrictEqual([
      "event-mercury-retrograde",
      "event-sun-ingress-cancer",
    ]);
  });

  it("keeps the events starting within an hour range", async () => {
    await expect(matching("hour", "between", [22, 23])).resolves.toStrictEqual([
      "event-venus-ingress-aries",
    ]);
    await expect(matching("hour", "between", [10, 10])).resolves.toStrictEqual([
      "event-mars-conjunct-venus",
      "event-sun-ingress-aries",
    ]);
    await expect(
      matching("hour", "not_between", [4, 22]),
    ).resolves.toStrictEqual([
      "event-mercury-retrograde",
      "event-venus-ingress-aries",
    ]);
  });

  it("keeps the events in the chosen duration buckets", async () => {
    await expect(
      matching("duration", "is_any_of", ["weeks"]),
    ).resolves.toStrictEqual(["event-mercury-retrograde"]);
    await expect(
      matching("duration", "is_none_of", ["instant"]),
    ).resolves.toStrictEqual(["event-mercury-retrograde"]);
    await expect(
      matching("duration", "is_any_of", ["minutes", "hours", "days", "months"]),
    ).resolves.toStrictEqual([]);
  });

  it("keeps instants or spans by temporality", async () => {
    await expect(
      matching("temporality", "is_any_of", ["Duration"]),
    ).resolves.toStrictEqual(["event-mercury-retrograde"]);
    await expect(
      matching("temporality", "is_none_of", ["Duration"]),
    ).resolves.toHaveLength(5);
  });

  it("compares the hour an event starts", async () => {
    const late = await matching("hour", "between", [22, 23]);

    await expect(matching("hour", "gte", 22)).resolves.toStrictEqual(late);
    await expect(matching("hour", "gt", 21)).resolves.toStrictEqual(late);
    await expect(matching("hour", "lt", 22)).resolves.toHaveLength(
      6 - late.length,
    );
    await expect(matching("hour", "lte", 23)).resolves.toHaveLength(6);
    await expect(matching("hour", "eq", 10)).resolves.toStrictEqual(
      await matching("hour", "between", [10, 10]),
    );

    const ten = await matching("hour", "eq", 10);

    await expect(matching("hour", "neq", 10)).resolves.toHaveLength(
      6 - ten.length,
    );
  });

  it("compares the duration in minutes", async () => {
    await expect(matching("duration-minutes", "gt", 0)).resolves.toStrictEqual([
      "event-mercury-retrograde",
    ]);
    await expect(matching("duration-minutes", "eq", 0)).resolves.toHaveLength(
      5,
    );
    await expect(matching("duration-minutes", "lte", 0)).resolves.toHaveLength(
      5,
    );
    await expect(
      matching("duration-minutes", "between", [1, 100_000]),
    ).resolves.toStrictEqual(["event-mercury-retrograde"]);
    await expect(
      matching("duration-minutes", "not_between", [1, 100_000]),
    ).resolves.toHaveLength(5);
    await expect(
      matching("duration-minutes", "gte", "1"),
    ).resolves.toHaveLength(1);
  });

  it("searches the summary and description text", async () => {
    await expect(matching("text", "contains", "INGRESS")).resolves.toHaveLength(
      3,
    );
    await expect(matching("text", "contains", "zodiac")).resolves.toStrictEqual(
      ["event-mars-conjunct-venus", "event-mercury-retrograde"],
    );
    await expect(
      matching("text", "not_contains", "ingress"),
    ).resolves.toHaveLength(3);
  });

  it("matches a wildcard character in the text literally", async () => {
    await expect(matching("text", "contains", "%")).resolves.toStrictEqual([]);
    await expect(matching("text", "contains", "_")).resolves.toStrictEqual([]);
  });

  it("leaves out an event whose zone cannot be read", async () => {
    const options = { extraSql: UNREADABLE_ZONE_SQL };

    for (const rule of [
      fieldRule("hour", "between", [0, 23]),
      fieldRule("weekday", "is_any_of", ["0", "1", "2", "3", "4", "5", "6"]),
      fieldRule("date", "between", ["2000-01-01", "2100-01-01"]),
    ]) {
      await expect(
        findMatchingEventIds(filterGroup("and", rule), options),
      ).resolves.not.toContain("event-unreadable-zone");
    }
  });

  it.each([
    ["date", "between", "2026-03-25"],
    ["date", "between", ["2026-03-25"]],
    ["date", "between", ["2026-03-31", "2026-03-01"]],
    ["date", "between", ["March", "2026-03-01"]],
    ["hour", "between", [5, null]],
    ["hour", "between", [9, 2]],
    ["hour", "between", [0, 24]],
    ["hour", "between", 5],
    ["hour", "is_any_of", [1, 2]],
    ["hour", "gt", "late"],
    ["hour", "gt", null],
    ["hour", "gt", [1, 2]],
    ["duration-minutes", "gt", ""],
    ["duration-minutes", "between", [5, 1]],
    ["duration-minutes", "is_any_of", [1]],
    ["weekday", "is_any_of", "3"],
    ["weekday", "is_any_of", [null, ""]],
    ["weekday", "between", ["1", "2"]],
    ["duration", "between", ["weeks"]],
    ["weekday", "is_any_of", ["7"]],
    ["duration", "is_any_of", ["fortnights"]],
    ["text", "contains", "  "],
    ["text", "starts_with", "Mars"],
  ])("ignores %s %s %j as unfinished", async (field, operator, value) => {
    await expect(matching(field, operator, value)).resolves.toHaveLength(6);
  });
});
