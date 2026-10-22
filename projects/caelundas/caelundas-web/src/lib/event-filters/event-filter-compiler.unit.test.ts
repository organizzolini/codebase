import { describe, expect, it } from "vitest";

import {
  fieldRule,
  filterGroup,
  findMatchingEventIds,
} from "../../../testing/event-filters";

import { compileEventFilter } from "./event-filter-compiler";

// Harmonics 1, 4 and 6, given to three of the seeded events.
const HARMONICS_SQL = `
  insert into tags (id, created_at, updated_at, "name", parent_id) values
    ('tag-harmonic', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Aspect Harmonic', null),
    ('tag-harmonic-1', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Harmonic 1', 'tag-harmonic'),
    ('tag-harmonic-4', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Harmonic 4', 'tag-harmonic'),
    ('tag-harmonic-10', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Harmonic 10', 'tag-harmonic');
  insert into tags_closure (ancestor_id, descendant_id) values
    ('tag-harmonic', 'tag-harmonic'),
    ('tag-harmonic-1', 'tag-harmonic-1'),
    ('tag-harmonic-4', 'tag-harmonic-4'),
    ('tag-harmonic-10', 'tag-harmonic-10'),
    ('tag-harmonic', 'tag-harmonic-1'),
    ('tag-harmonic', 'tag-harmonic-4'),
    ('tag-harmonic', 'tag-harmonic-10');
  insert into calendar_event_tags (calendar_event_id, tag_id) values
    ('event-mars-conjunct-venus', 'tag-harmonic-1'),
    ('event-mars-square-saturn', 'tag-harmonic-4'),
    ('event-mercury-retrograde', 'tag-harmonic-10');
`;

async function matchingHarmonics(
  operator: string,
  value: unknown,
): Promise<string[]> {
  return findMatchingEventIds(
    filterGroup(
      "and",
      fieldRule("tag:tag-harmonic", operator, value as number),
    ),
    { extraSql: HARMONICS_SQL },
  );
}

describe(compileEventFilter, () => {
  it("compares the number a tag is named for", async () => {
    await expect(matchingHarmonics("eq", 4)).resolves.toStrictEqual([
      "event-mars-square-saturn",
    ]);
    await expect(matchingHarmonics("gt", 1)).resolves.toStrictEqual([
      "event-mars-square-saturn",
      "event-mercury-retrograde",
    ]);
    await expect(matchingHarmonics("gte", 4)).resolves.toStrictEqual([
      "event-mars-square-saturn",
      "event-mercury-retrograde",
    ]);
    await expect(matchingHarmonics("lt", 4)).resolves.toStrictEqual([
      "event-mars-conjunct-venus",
    ]);
    await expect(matchingHarmonics("lte", 4)).resolves.toStrictEqual([
      "event-mars-conjunct-venus",
      "event-mars-square-saturn",
    ]);
    await expect(matchingHarmonics("between", [2, 10])).resolves.toStrictEqual([
      "event-mars-square-saturn",
      "event-mercury-retrograde",
    ]);
  });

  it("reads the number, not the text, so 10 is greater than 4", async () => {
    await expect(matchingHarmonics("gt", 4)).resolves.toStrictEqual([
      "event-mercury-retrograde",
    ]);
  });

  it("keeps the events without the number for does not equal", async () => {
    await expect(matchingHarmonics("neq", 4)).resolves.toHaveLength(5);
    await expect(matchingHarmonics("neq", 4)).resolves.not.toContain(
      "event-mars-square-saturn",
    );
    await expect(
      matchingHarmonics("not_between", [2, 10]),
    ).resolves.toHaveLength(4);
  });

  it.each([
    ["eq", "four"],
    ["eq", null],
    ["gt", [1, 2]],
    ["between", [9, 2]],
    ["between", 5],
  ])("ignores harmonic %s %j as unfinished", async (operator, value) => {
    await expect(matchingHarmonics(operator, value)).resolves.toHaveLength(6);
  });

  it("matches everything beneath a chosen tag", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "and",
          fieldRule("tag:tag-type", "is_any_of", ["tag-aspect"]),
        ),
      ),
    ).resolves.toStrictEqual([
      "event-mars-conjunct-venus",
      "event-mars-square-saturn",
    ]);
  });

  it("keeps an event carrying any of the chosen tags", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "and",
          fieldRule("tag:tag-planet", "is_any_of", [
            "tag-mercury",
            "tag-saturn",
          ]),
        ),
      ),
    ).resolves.toStrictEqual([
      "event-mars-square-saturn",
      "event-mercury-retrograde",
    ]);
  });

  it("keeps only an event carrying all of the chosen tags", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "and",
          fieldRule("tag:tag-planet", "has_all_of", ["tag-mars", "tag-venus"]),
        ),
      ),
    ).resolves.toStrictEqual(["event-mars-conjunct-venus"]);
  });

  it("counts a tag picked twice once for has all of", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "and",
          fieldRule("tag:tag-planet", "has_all_of", ["tag-venus", "tag-venus"]),
        ),
      ),
    ).resolves.toStrictEqual([
      "event-mars-conjunct-venus",
      "event-venus-ingress-aries",
    ]);
  });

  it("drops an event carrying any of the excluded tags or their children", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "and",
          fieldRule("tag:tag-type", "is_none_of", [
            "tag-aspect",
            "tag-ingress",
          ]),
        ),
      ),
    ).resolves.toStrictEqual(["event-mercury-retrograde"]);
  });

  it("flips a negated rule", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "and",
          fieldRule("tag:tag-sign", "is_any_of", ["tag-aries"], {
            negated: true,
          }),
        ),
      ),
    ).resolves.toStrictEqual([
      "event-mars-conjunct-venus",
      "event-mars-square-saturn",
      "event-mercury-retrograde",
      "event-sun-ingress-cancer",
    ]);
  });

  it("combines rules with and", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "and",
          fieldRule("tag:tag-type", "is_any_of", ["tag-ingress"]),
          fieldRule("tag:tag-planet", "is_any_of", ["tag-sun"]),
        ),
      ),
    ).resolves.toStrictEqual([
      "event-sun-ingress-aries",
      "event-sun-ingress-cancer",
    ]);
  });

  it("combines rules with or", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "or",
          fieldRule("tag:tag-type", "is_any_of", ["tag-retrograde"]),
          fieldRule("tag:tag-planet", "is_any_of", ["tag-saturn"]),
        ),
      ),
    ).resolves.toStrictEqual([
      "event-mars-square-saturn",
      "event-mercury-retrograde",
    ]);
  });

  it("nests an or group inside an and group", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "and",
          filterGroup(
            "or",
            fieldRule("tag:tag-planet", "is_any_of", ["tag-mars"]),
            fieldRule("tag:tag-planet", "is_any_of", ["tag-venus"]),
          ),
          fieldRule("tag:tag-element", "is_any_of", ["tag-fire"]),
        ),
      ),
    ).resolves.toStrictEqual(["event-venus-ingress-aries"]);
  });

  it("nests an and group inside an or group", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "or",
          filterGroup(
            "and",
            fieldRule("tag:tag-planet", "is_any_of", ["tag-mars"]),
            fieldRule("tag:tag-type", "is_any_of", ["tag-square"]),
          ),
          fieldRule("tag:tag-type", "is_any_of", ["tag-retrograde"]),
        ),
      ),
    ).resolves.toStrictEqual([
      "event-mars-square-saturn",
      "event-mercury-retrograde",
    ]);
  });

  it("compiles nothing for an empty query", () => {
    expect(compileEventFilter(filterGroup("and"))).toBeNull();
  });

  it("ignores rules with no operator, no values, or an unknown field", () => {
    const incomplete = filterGroup(
      "and",
      fieldRule("tag:tag-planet", "", ["tag-mars"]),
      fieldRule("tag:tag-planet", "is_any_of", []),
      fieldRule("tag:tag-planet", "is_any_of", undefined),
      fieldRule("tag:tag-planet", "is_any_of", [3]),
      fieldRule("tag:tag-planet", "is_between", ["tag-mars"]),
      fieldRule("unknown", "is_any_of", ["tag-mars"]),
      filterGroup("or"),
    );

    expect(compileEventFilter(incomplete)).toBeNull();
    expect(compileEventFilter(undefined)).toBeNull();
  });

  it("keeps the complete rules beside incomplete ones", async () => {
    await expect(
      findMatchingEventIds(
        filterGroup(
          "or",
          fieldRule("tag:tag-planet", "is_any_of", []),
          filterGroup("and"),
          fieldRule("tag:tag-planet", "is_any_of", ["tag-saturn"]),
        ),
      ),
    ).resolves.toStrictEqual(["event-mars-square-saturn"]);
  });

  it("binds every value as a parameter rather than writing it into the sql", () => {
    const compiled = compileEventFilter(
      filterGroup(
        "and",
        fieldRule("tag:tag-planet", "is_any_of", ["x' or 1 = 1 --"]),
      ),
    );

    expect(compiled?.sql).not.toContain("x'");
    expect(compiled?.parameters).toContain("x' or 1 = 1 --");
  });
});
