import { describe, expect, it } from "vitest";

import {
  getCalendarReloadKey,
  validateCalendarSearch,
} from "./calendar-search.utilities";

describe(validateCalendarSearch, () => {
  it("reads the sorts as a list, or as the one an older link holds, and forgets the rest", () => {
    const sort = { direction: "asc", key: "name" };

    expect(validateCalendarSearch({ sort: [sort] }).sort).toStrictEqual([sort]);
    expect(validateCalendarSearch({ sort }).sort).toStrictEqual([sort]);
    expect(validateCalendarSearch({ sort: [] }).sort).toBeUndefined();
    expect(validateCalendarSearch({ sort: "name" }).sort).toBeUndefined();
    expect(validateCalendarSearch({}).sort).toBeUndefined();
  });

  it("reads the table's columns as a list or as one, and none when there are none", () => {
    expect(
      validateCalendarSearch({ columns: ["name", "start"] }).columns,
    ).toStrictEqual(["name", "start"]);
    expect(validateCalendarSearch({ columns: "name" }).columns).toStrictEqual([
      "name",
    ]);
    expect(validateCalendarSearch({ columns: [] }).columns).toBeUndefined();
    expect(validateCalendarSearch({ columns: [1] }).columns).toBeUndefined();
  });

  it("reads colors turned off", () => {
    expect(validateCalendarSearch({ colors: false }).colors).toBe(false);
    expect(validateCalendarSearch({ colors: "false" }).colors).toBe(false);
  });

  it("leaves colors on for anything else, so a stale link still opens", () => {
    for (const colors of [undefined, true, "true", 0, null, "off"]) {
      expect(validateCalendarSearch({ colors }).colors).toBeUndefined();
    }
  });

  it("ignores the retired clusters parameter of an old link", () => {
    for (const clusters of [false, "false", true, "true", 0, null]) {
      expect(validateCalendarSearch({ clusters })).not.toHaveProperty(
        "clusters",
      );
    }
  });

  it("reads an empty or unparsable grouping as none, never as no grouping", () => {
    expect(validateCalendarSearch({ group: [] }).group).toBeUndefined();
    expect(validateCalendarSearch({ group: [1] }).group).toBeUndefined();
    expect(validateCalendarSearch({ group: "type" }).group).toBeUndefined();
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

  it("ignores the color a stale link names, color following the grouping", () => {
    expect(
      validateCalendarSearch({ color: { depth: 2, field: "tag:type" } }),
    ).not.toHaveProperty("color");
  });

  it("passes the sky keys through untouched, for the backdrop to read", () => {
    const sky = {
      skyfield: "off",
      "skyfield.altBottom": 5,
      "skyfield.bottom": "0d1533",
      "skyfield.constellations": "zodiac,ursa_major",
      "skyfield.debug": true,
      "skyfield.ecliptic": true,
      "skyfield.eclipticColor": "ffb877",
      "skyfield.eclipticOpacity": 0.4,
      "skyfield.eclipticWidth": 1.5,
      "skyfield.lat": 51.5,
      "skyfield.lineColor": "ff8800",
      "skyfield.lineOpacity": 0.5,
      "skyfield.lineWidth": 2,
      "skyfield.lon": -0.1,
      "skyfield.maxMag": 5,
      "skyfield.opacity": 0.4,
      "skyfield.pixelsPerSecond": 20,
      "skyfield.starScale": 1.5,
      "skyfield.top": "04060f",
      "skyfield.vFov": 30,
    };

    expect(validateCalendarSearch({ ...sky, view: "month" })).toMatchObject(
      sky,
    );
  });

  it("ignores the calendar opacity an old link carries", () => {
    expect(
      validateCalendarSearch({
        "sky.surfaceOpacity": 0.7,
        "skyfield.surfaceOpacity": 0.7,
      }),
    ).toStrictEqual(validateCalendarSearch({}));
  });

  it("reads the old sky keys as skyfield keys, and writes only the new", () => {
    const search = validateCalendarSearch({
      sky: "off",
      "sky.lat": 10,
      "sky.opacity": 1,
    });

    expect(search).toMatchObject({
      skyfield: "off",
      "skyfield.lat": 10,
      "skyfield.opacity": 1,
    });
    expect(search).not.toHaveProperty("sky");
    expect(search).not.toHaveProperty("sky.lat");
  });

  it("prefers a skyfield key to the sky key it replaces", () => {
    expect(
      validateCalendarSearch({
        "sky.lat": 10,
        "sky.lon": 20,
        "skyfield.lat": 30,
      }),
    ).toMatchObject({ "skyfield.lat": 30, "skyfield.lon": 20 });
  });

  it("keeps the sky keys out of what decides a reload", () => {
    expect(
      getCalendarReloadKey({ date: "2026-03-01", "skyfield.lat": 10 }),
    ).toBe(getCalendarReloadKey({ date: "2026-03-01", "skyfield.lat": 20 }));
    expect(getCalendarReloadKey({ date: "2026-03-01" })).not.toBe(
      getCalendarReloadKey({ date: "2026-04-01" }),
    );
  });

  it("reads the metrics as a list or one slug, dropping what is no slug", () => {
    expect(
      validateCalendarSearch({
        metrics: ["progressive-events", "STALE", "events"],
      }).metrics,
    ).toStrictEqual(["progressive-events", "events"]);
    expect(validateCalendarSearch({ metrics: "events" }).metrics).toStrictEqual(
      ["events"],
    );
    expect(
      validateCalendarSearch({ metrics: ["STALE"] }).metrics,
    ).toBeUndefined();
    expect(validateCalendarSearch({ metrics: [] }).metrics).toBeUndefined();
    expect(validateCalendarSearch({}).metrics).toBeUndefined();
  });

  it("reads an old metric name in a link as its slug, once", () => {
    expect(
      validateCalendarSearch({
        metrics: ["TOTAL_DURATION_MINUTES", "duration", "PROGRESSIVE_HOURS"],
      }).metrics,
    ).toStrictEqual(["duration"]);
    expect(
      validateCalendarSearch({ metrics: "TOTAL_DURATION_MINUTES" }).metrics,
    ).toStrictEqual(["duration"]);
  });

  it("reads the comparison turned on, and leaves it off for anything else", () => {
    expect(validateCalendarSearch({ compare: true }).compare).toBe(true);
    expect(validateCalendarSearch({ compare: "true" }).compare).toBe(true);

    for (const compare of [undefined, false, "false", 1, null, "yes"]) {
      expect(validateCalendarSearch({ compare }).compare).toBeUndefined();
    }
  });

  it("reads hiding empty groups turned on, and leaves it off for anything else", () => {
    expect(validateCalendarSearch({ hideEmpty: true }).hideEmpty).toBe(true);
    expect(validateCalendarSearch({ hideEmpty: "true" }).hideEmpty).toBe(true);

    for (const hideEmpty of [undefined, false, "false", 1, null, "yes"]) {
      expect(validateCalendarSearch({ hideEmpty }).hideEmpty).toBeUndefined();
    }
  });

  it("reads a sort by a metric, an old name as its slug, and forgets a metric that is no slug", () => {
    expect(
      validateCalendarSearch({
        sort: [
          { direction: "desc", key: "metric", metric: "progressive-events" },
        ],
      }).sort,
    ).toStrictEqual([
      { direction: "desc", key: "metric", metric: "progressive-events" },
    ]);
    expect(
      validateCalendarSearch({
        sort: [{ direction: "desc", key: "metric", metric: "SPANS" }],
      }).sort,
    ).toStrictEqual([
      { direction: "desc", key: "metric", metric: "progressive-events" },
    ]);
    expect(
      validateCalendarSearch({
        sort: [{ direction: "asc", key: "metric", metric: 3 }],
      }).sort?.[0]?.metric,
    ).toBeUndefined();
  });

  it("keeps the metrics, comparison, hidden groups and folded strips out of what decides a reload", () => {
    expect(
      getCalendarReloadKey({
        compare: true,
        fold: "select",
        hideEmpty: true,
        metrics: ["SPANS"],
      }),
    ).toBe(getCalendarReloadKey({ metrics: ["EVENTS"] }));
  });

  it("reads the all-day state as c or e, and keeps it out of what decides a reload", () => {
    expect(validateCalendarSearch({ ad: "c" }).ad).toBe("c");
    expect(validateCalendarSearch({ ad: "e" }).ad).toBe("e");
    expect(validateCalendarSearch({ ad: "x" }).ad).toBeUndefined();
    expect(validateCalendarSearch({}).ad).toBeUndefined();
    expect(getCalendarReloadKey({ ad: "c" })).toBe(getCalendarReloadKey({}));
  });

  it("reads the folded strips in the strips' order, ignoring what it does not know", () => {
    expect(validateCalendarSearch({ fold: "sort,select" }).fold).toBe(
      "select,sort",
    );
    expect(validateCalendarSearch({ fold: "group,nope" }).fold).toBe("group");
    expect(validateCalendarSearch({ fold: "nope" }).fold).toBeUndefined();
    expect(validateCalendarSearch({ fold: 3 }).fold).toBeUndefined();
    expect(validateCalendarSearch({}).fold).toBeUndefined();
  });
});
