import { describe, expect, it } from "vitest";

import { validateCalendarSearch } from "./calendar-search";

describe(validateCalendarSearch, () => {
  it("reads colors turned off", () => {
    expect(validateCalendarSearch({ colors: false }).colors).toBe(false);
    expect(validateCalendarSearch({ colors: "false" }).colors).toBe(false);
  });

  it("leaves colors on for anything else, so a stale link still opens", () => {
    for (const colors of [undefined, true, "true", 0, null, "off"]) {
      expect(validateCalendarSearch({ colors }).colors).toBeUndefined();
    }
  });

  it("reads merging turned off, and leaves it on for anything else", () => {
    expect(validateCalendarSearch({ clusters: false }).clusters).toBe(false);
    expect(validateCalendarSearch({ clusters: "false" }).clusters).toBe(false);

    for (const clusters of [undefined, true, "true", 0, null]) {
      expect(validateCalendarSearch({ clusters }).clusters).toBeUndefined();
    }
  });

  it("reads the tags a grouping level picks, and forgets what is not a list of ids", () => {
    expect(
      validateCalendarSearch({
        group: [
          { field: "tag:type", tags: ["a", "b"] },
          { field: "tag:planet", tags: [1, 2] },
        ],
      }).group,
    ).toMatchObject([
      { field: "tag:type", tags: ["a", "b"] },
      { field: "tag:planet" },
    ]);
  });
});
