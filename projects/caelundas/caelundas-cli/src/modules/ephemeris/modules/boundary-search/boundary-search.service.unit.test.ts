import moment from "moment-timezone";
import { describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { BoundarySearchService } from "./boundary-search.service";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { Moment } from "moment-timezone";

const MINUTE = 60_000;
const origin = moment.utc("2026-01-01T00:00:00Z");
const at = (minutes: number): Moment =>
  moment.utc(origin.valueOf() + minutes * MINUTE);

describe(BoundarySearchService, () => {
  /** A state that holds through `last` minutes after the origin. */
  const holdsThrough =
    (last: number) =>
    (minute: Moment): boolean =>
      minute.valueOf() <= at(last).valueOf();

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(BoundarySearchService);

    expect(instance).toBeInstanceOf(BoundarySearchService);
  });

  it("finds the last minute a state holds at, searching forward", async () => {
    const { instance } = await buildTestingModule(BoundarySearchService);

    const bracket = instance.find({
      direction: 1,
      from: at(0),
      isInside: holdsThrough(4321),
      limit: at(100_000),
      stepMinutes: 1440,
    });

    expect(bracket?.inside.toISOString()).toBe(at(4321).toISOString());
    expect(bracket?.outside.toISOString()).toBe(at(4322).toISOString());
  });

  it("finds the first minute a state holds at, searching backward", async () => {
    const { instance } = await buildTestingModule(BoundarySearchService);

    const bracket = instance.find({
      direction: -1,
      from: at(0),
      isInside: (minute) => minute.valueOf() >= at(-3001).valueOf(),
      limit: at(-100_000),
      stepMinutes: 1440,
    });

    expect(bracket?.inside.toISOString()).toBe(at(-3001).toISOString());
    expect(bracket?.outside.toISOString()).toBe(at(-3002).toISOString());
  });

  it("probes the limit itself before giving up", async () => {
    const { instance } = await buildTestingModule(BoundarySearchService);
    const isInside = vi.fn<(minute: Moment) => boolean>(holdsThrough(499));

    const bracket = instance.find({
      direction: 1,
      from: at(0),
      isInside,
      limit: at(500),
      stepMinutes: 1440,
    });

    expect(isInside).toHaveBeenCalledWith(at(500));
    expect(bracket?.inside.toISOString()).toBe(at(499).toISOString());
  });

  it("returns undefined when the state holds all the way to the limit", async () => {
    const { instance } = await buildTestingModule(BoundarySearchService);

    expect(
      instance.find({
        direction: 1,
        from: at(0),
        isInside: () => true,
        limit: at(10_000),
        stepMinutes: 1440,
      }),
    ).toBeUndefined();
  });

  it("stops narrowing at a coarser resolution when one is given", async () => {
    const { instance } = await buildTestingModule(BoundarySearchService);

    const bracket = instance.find({
      direction: 1,
      from: at(0),
      isInside: holdsThrough(2000),
      limit: at(100_000),
      resolutionMinutes: 1440,
      stepMinutes: 1440,
    });

    expect(bracket?.inside.toISOString()).toBe(at(1440).toISOString());
    expect(bracket?.outside.toISOString()).toBe(at(2880).toISOString());
  });

  describe("findEdgeEvents", () => {
    const window = {
      end: moment.utc("2026-01-02T00:00:00Z"),
      start: moment.utc("2026-01-01T00:00:00Z"),
    };
    const flipBefore = moment.utc("2025-12-30T12:00:00Z").valueOf();
    const flipAfter = moment.utc("2026-01-03T06:30:00Z").valueOf();
    const stateAt = (minute: Moment): number =>
      Number(minute.valueOf() >= flipBefore) +
      Number(minute.valueOf() >= flipAfter);
    const flip = (minute: Moment): DetectedCalendarEvent => ({
      description: "flip",
      end: minute,
      start: minute,
      summary: "flip",
      tags: ["Flip"],
    });
    const detectAt = (minute: Moment): DetectedCalendarEvent[] =>
      [flipAfter, flipBefore].includes(minute.valueOf()) ? [flip(minute)] : [];

    it("finds the boundary each side of the window, to the minute", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);

      const events = instance.findEdgeEvents({
        detectAt,
        stateAt,
        stepMinutes: 360,
        window,
      });

      expect(events.map((event) => event.start.toISOString())).toStrictEqual([
        "2025-12-30T12:00:00.000Z",
        "2026-01-03T06:30:00.000Z",
      ]);
    });

    it("tries the minutes next to a bracket when the detector stamps a neighbor", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);

      const events = instance.findEdgeEvents({
        detectAt: (minute) =>
          [flipAfter - MINUTE, flipBefore - MINUTE].includes(minute.valueOf())
            ? [flip(minute)]
            : [],
        stateAt,
        stepMinutes: 360,
        window,
      });

      expect(events).toHaveLength(2);
    });

    it("returns nothing for a side where the state never changes", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);

      expect(
        instance.findEdgeEvents({
          detectAt,
          stateAt: () => 0,
          stepMinutes: 1_000_000,
          window,
        }),
      ).toStrictEqual([]);
    });

    it("skips a minute whose events are not the boundary sought", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);

      const events = instance.findEdgeEvents({
        detectAt,
        isBoundary: () => false,
        stateAt,
        stepMinutes: 360,
        window,
      });

      expect(events).toStrictEqual([]);
    });
  });

  describe("at the range's limits", () => {
    const first = moment.utc("1900-01-01T00:00:00Z");
    const last = moment.utc("2100-12-31T23:59:00Z");
    const firstWindow = {
      end: moment.utc("1900-01-01T01:00:00Z"),
      start: first,
    };
    const lastWindow = {
      end: last,
      start: moment.utc("2100-12-31T22:00:00Z"),
    };
    const flip = (minute: Moment): DetectedCalendarEvent => ({
      description: "flip",
      end: minute,
      start: minute,
      summary: "flip",
      tags: ["Flip"],
    });
    // Compared as numbers: a string handed to a moment is parsed again on
    // each of the hundreds of thousands of minutes the search walks.
    const flipsAt =
      (at_: string) =>
      (minute: Moment): DetectedCalendarEvent[] =>
        minute.valueOf() === Date.parse(at_) ? [flip(minute)] : [];

    it("knows the range's first and last minute", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);

      expect(instance.getLimit(-1, first).toISOString()).toBe(
        "1900-01-01T00:00:00.000Z",
      );
      expect(instance.getLimit(1, last).toISOString()).toBe(
        "2100-12-31T23:59:00.000Z",
      );
    });

    it("lets a window reaching past a limit keep its own edge", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);

      expect(
        instance.getLimit(-1, moment.utc("1899-12-31T14:00:00Z")).toISOString(),
      ).toBe("1899-12-31T14:00:00.000Z");
      expect(
        instance.getLimit(1, moment.utc("2101-01-01T04:59:00Z")).toISOString(),
      ).toBe("2101-01-01T04:59:00.000Z");
    });

    it("pulls an event past a limit back to it, and leaves one inside alone", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);
      const before = flip(moment.utc("1899-12-30T12:00:00Z"));
      const after = flip(moment.utc("2101-01-03T06:30:00Z"));
      const inside = flip(moment.utc("2026-01-03T06:30:00Z"));

      expect(instance.clip(before, firstWindow).start.toISOString()).toBe(
        "1900-01-01T00:00:00.000Z",
      );
      expect(instance.clip(before, firstWindow).end.toISOString()).toBe(
        "1900-01-01T00:00:00.000Z",
      );
      expect(instance.clip(after, lastWindow).start.toISOString()).toBe(
        "2100-12-31T23:59:00.000Z",
      );
      expect(instance.clip(inside, lastWindow)).toBe(inside);
    });

    it("walks past the first limit to name the boundary, then clips it to the limit", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);
      const flipBefore = "1899-12-30T12:00:00.000Z";
      const flipBeforeMilliseconds = Date.parse(flipBefore);

      const events = instance.findEdgeEvents({
        detectAt: flipsAt(flipBefore),
        stateAt: (minute) => Number(minute.valueOf() >= flipBeforeMilliseconds),
        stepMinutes: 360,
        window: firstWindow,
      });

      expect(events.map((event) => event.start.toISOString())).toStrictEqual([
        "1900-01-01T00:00:00.000Z",
      ]);
      expect(events[0]?.end.toISOString()).toBe("1900-01-01T00:00:00.000Z");
    });

    it("walks past the last limit to name the boundary, then clips it to the limit", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);
      const flipAfter = "2101-01-03T06:30:00.000Z";
      const flipAfterMilliseconds = Date.parse(flipAfter);

      const events = instance.findEdgeEvents({
        detectAt: flipsAt(flipAfter),
        stateAt: (minute) => Number(minute.valueOf() >= flipAfterMilliseconds),
        stepMinutes: 360,
        window: lastWindow,
      });

      expect(events.map((event) => event.start.toISOString())).toStrictEqual([
        "2100-12-31T23:59:00.000Z",
      ]);
    });

    it("finds a boundary the range ends before, with the span still clipped", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);

      const bracket = instance.findBeyondLimit({
        direction: 1,
        from: last,
        isInside: (minute) => minute.isBefore("2101-02-01T00:00:00Z"),
        stepMinutes: 1440,
      });

      expect(bracket?.inside.toISOString()).toBe("2101-01-31T23:59:00.000Z");
    });

    it("gives up on a state that holds beyond the extension", async () => {
      const { instance } = await buildTestingModule(BoundarySearchService);

      expect(
        instance.findBeyondLimit({
          direction: 1,
          from: last,
          isInside: () => true,
          stepMinutes: 1440,
        }),
      ).toBeUndefined();
    });
  });
});
