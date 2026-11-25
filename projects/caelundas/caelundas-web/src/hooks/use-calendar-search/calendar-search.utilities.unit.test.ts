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

  it("reads merging turned off, and leaves it on for anything else", () => {
    expect(validateCalendarSearch({ clusters: false }).clusters).toBe(false);
    expect(validateCalendarSearch({ clusters: "false" }).clusters).toBe(false);

    for (const clusters of [undefined, true, "true", 0, null]) {
      expect(validateCalendarSearch({ clusters }).clusters).toBeUndefined();
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

  it("reads the metrics as a list or one name, dropping names it does not know", () => {
    expect(
      validateCalendarSearch({ metrics: ["SPANS", "STALE", "EVENTS"] }).metrics,
    ).toStrictEqual(["SPANS", "EVENTS"]);
    expect(validateCalendarSearch({ metrics: "EVENTS" }).metrics).toStrictEqual(
      ["EVENTS"],
    );
    expect(
      validateCalendarSearch({ metrics: ["STALE"] }).metrics,
    ).toBeUndefined();
    expect(validateCalendarSearch({ metrics: [] }).metrics).toBeUndefined();
    expect(validateCalendarSearch({}).metrics).toBeUndefined();
  });

  it("reads the comparison turned on, and leaves it off for anything else", () => {
    expect(validateCalendarSearch({ compare: true }).compare).toBe(true);
    expect(validateCalendarSearch({ compare: "true" }).compare).toBe(true);

    for (const compare of [undefined, false, "false", 1, null, "yes"]) {
      expect(validateCalendarSearch({ compare }).compare).toBeUndefined();
    }
  });

  it("reads a sort by a metric, and forgets a metric that is not a name", () => {
    expect(
      validateCalendarSearch({
        sort: [{ direction: "desc", key: "metric", metric: "SPANS" }],
      }).sort,
    ).toStrictEqual([{ direction: "desc", key: "metric", metric: "SPANS" }]);
    expect(
      validateCalendarSearch({
        sort: [{ direction: "asc", key: "metric", metric: 3 }],
      }).sort?.[0]?.metric,
    ).toBeUndefined();
  });

  it("keeps the metrics and the comparison out of what decides a reload", () => {
    expect(getCalendarReloadKey({ compare: true, metrics: ["SPANS"] })).toBe(
      getCalendarReloadKey({ metrics: ["EVENTS"] }),
    );
  });
});
