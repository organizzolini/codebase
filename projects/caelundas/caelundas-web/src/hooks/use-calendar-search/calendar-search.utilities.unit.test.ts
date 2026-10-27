import { describe, expect, it } from "vitest";

import {
  getCalendarReloadKey,
  validateCalendarSearch,
} from "./calendar-search.utilities";

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

  it("reads what the events are colored by like a level of a grouping", () => {
    expect(
      validateCalendarSearch({ color: { depth: 2, field: "tag:type" } }).color,
    ).toMatchObject({
      depth: 2,
      field: "tag:type",
    });
    expect(validateCalendarSearch({ color: "nope" }).color).toBeUndefined();
  });

  it("passes the sky keys through untouched, for the backdrop to read", () => {
    const sky = {
      sky: "off",
      "sky.altBottom": 5,
      "sky.debug": true,
      "sky.lat": 51.5,
      "sky.lon": -0.1,
      "sky.maxMag": 5,
      "sky.pixelsPerSecond": 20,
      "sky.starScale": 1.5,
      "sky.vFov": 30,
    };

    expect(validateCalendarSearch({ ...sky, view: "month" })).toMatchObject(
      sky,
    );
  });

  it("keeps the sky keys out of what decides a reload", () => {
    expect(getCalendarReloadKey({ date: "2026-03-01", "sky.lat": 10 })).toBe(
      getCalendarReloadKey({ date: "2026-03-01", "sky.lat": 20 }),
    );
    expect(getCalendarReloadKey({ date: "2026-03-01" })).not.toBe(
      getCalendarReloadKey({ date: "2026-04-01" }),
    );
  });
});
