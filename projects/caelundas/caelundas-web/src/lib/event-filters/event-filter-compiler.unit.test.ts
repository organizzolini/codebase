import { describe, expect, it } from "vitest";

import {
  fieldRule,
  filterGroup,
  findMatchingEventIds,
} from "../../../testing/event-filters";

import { compileEventFilter } from "./event-filter-compiler";

describe(compileEventFilter, () => {
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
