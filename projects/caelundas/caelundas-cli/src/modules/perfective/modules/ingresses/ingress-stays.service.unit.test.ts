import { createMock } from "@golevelup/ts-vitest";
import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ingressBodies } from "../../../caelundas/caelundas.constants";
import { bodyDisplayName } from "../../../caelundas/caelundas.types";

import { IngressStaysService } from "./ingress-stays.service";

import type { Body } from "../../../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { SweepWindow } from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { SignTransitsService } from "./sign-transits.service";
import type { Moment } from "moment-timezone";

const window: SweepWindow = {
  end: moment.utc("2026-03-31T23:59:00.000Z"),
  start: moment.utc("2026-03-01T00:00:00.000Z"),
};
const entryStart = moment.utc("2026-02-10T08:00:00.000Z");
const exitEnd = moment.utc("2026-04-12T16:30:00.000Z");

/** Builds the service over a stand-in that places every body in `zones` by minute. */
function buildService(args: {
  entry: Record<number, number>;
  zoneAt: Record<string, number>;
}): IngressStaysService {
  const signTransits = createMock<SignTransitsService>();
  signTransits.getZoneEntry.mockImplementation(({ size }) => ({
    index: args.entry[size] ?? 0,
    start: entryStart,
  }));
  signTransits.getZoneExit.mockReturnValue(exitEnd);
  signTransits.getZoneAt.mockImplementation(
    (_body: Body, minute: Moment, size: number) =>
      args.zoneAt[`${String(size)}@${minute.toISOString()}`] ?? 0,
  );

  return new IngressStaysService(new LoggerService(), signTransits);
}

/** An ingress event as the sweep emits it: an instant tagged for one body. */
function ingress(args: {
  body: string;
  iso: string;
  kind?: "Decan" | "Peak";
}): DetectedCalendarEvent {
  const date = moment.utc(args.iso);
  return {
    description: `${args.body} ingress`,
    end: date,
    start: date,
    summary: `${args.body} ingress`,
    tags: [
      "Astronomy",
      "Astrology",
      "Ingress",
      ...(args.kind === undefined ? [] : [args.kind]),
      args.body,
      "Aries",
    ],
  };
}

/** A body's stays as description, start and end. */
function staysOf(
  events: DetectedCalendarEvent[],
  body: string,
  tag: "Decan" | "Peak",
): [string, string, string][] {
  return events
    .filter((event) => event.tags.includes(body) && event.tags.includes(tag))
    .map((event) => [
      event.description,
      event.start.toISOString(),
      event.end.toISOString(),
    ]);
}

describe(IngressStaysService, () => {
  it("gives every ingress body a decan stay and a half stay when nothing changes", () => {
    const service = buildService({ entry: { 10: 0, 15: 0 }, zoneAt: {} });

    const events = service.detect([], window);

    for (const body of ingressBodies) {
      const name = bodyDisplayName(body);

      expect(staysOf(events, name, "Decan")).toHaveLength(1);
      expect(staysOf(events, name, "Peak")).toHaveLength(1);
    }
  });

  it("chains the stay underway, a decan ingress and a sign ingress", () => {
    const service = buildService({
      entry: { 10: 1 },
      zoneAt: {
        "10@2026-03-10T00:00:00.000Z": 2,
        "10@2026-03-20T00:00:00.000Z": 3,
      },
    });

    const events = service.detect(
      [
        ingress({
          body: "Mars",
          iso: "2026-03-10T00:00:00.000Z",
          kind: "Decan",
        }),
        ingress({ body: "Mars", iso: "2026-03-20T00:00:00.000Z" }),
      ],
      window,
    );

    expect(staysOf(events, "Mars", "Decan")).toStrictEqual([
      [
        "Mars in decan 2 Aries",
        "2026-02-10T08:00:00.000Z",
        "2026-03-10T00:00:00.000Z",
      ],
      [
        "Mars in decan 3 Aries",
        "2026-03-10T00:00:00.000Z",
        "2026-03-20T00:00:00.000Z",
      ],
      [
        "Mars in decan 1 Taurus",
        "2026-03-20T00:00:00.000Z",
        "2026-04-12T16:30:00.000Z",
      ],
    ]);
  });

  it("names the last decan of the sign a retrograde body re-enters", () => {
    const service = buildService({
      entry: { 10: 3 },
      zoneAt: { "10@2026-03-05T00:00:00.000Z": 2 },
    });

    const events = service.detect(
      [ingress({ body: "Mars", iso: "2026-03-05T00:00:00.000Z" })],
      window,
    );

    expect(
      staysOf(events, "Mars", "Decan").map(([description]) => description),
    ).toStrictEqual(["Mars in decan 1 Taurus", "Mars in decan 3 Aries"]);
  });

  it("splits a sign at the peak ingress into its two halves", () => {
    const service = buildService({
      entry: { 15: 0 },
      zoneAt: {
        "15@2026-03-10T00:00:00.000Z": 1,
        "15@2026-03-25T00:00:00.000Z": 2,
      },
    });

    const events = service.detect(
      [
        ingress({ body: "Sun", iso: "2026-03-10T00:00:00.000Z", kind: "Peak" }),
        ingress({ body: "Sun", iso: "2026-03-25T00:00:00.000Z" }),
      ],
      window,
    );

    expect(staysOf(events, "Sun", "Peak")).toStrictEqual([
      [
        "Sun in first half of Aries",
        "2026-02-10T08:00:00.000Z",
        "2026-03-10T00:00:00.000Z",
      ],
      [
        "Sun in second half of Aries",
        "2026-03-10T00:00:00.000Z",
        "2026-03-25T00:00:00.000Z",
      ],
      [
        "Sun in first half of Taurus",
        "2026-03-25T00:00:00.000Z",
        "2026-04-12T16:30:00.000Z",
      ],
    ]);
  });

  it("does not let a decan ingress split a half or a peak split a decan", () => {
    const service = buildService({ entry: { 10: 0, 15: 0 }, zoneAt: {} });

    const events = service.detect(
      [
        ingress({
          body: "Sun",
          iso: "2026-03-10T00:00:00.000Z",
          kind: "Decan",
        }),
        ingress({
          body: "Moon",
          iso: "2026-03-12T00:00:00.000Z",
          kind: "Peak",
        }),
      ],
      window,
    );

    expect(staysOf(events, "Sun", "Peak")).toHaveLength(1);
    expect(staysOf(events, "Moon", "Decan")).toHaveLength(1);
  });

  it("tags a stay for filtering by body, sign, decan and half", () => {
    const service = buildService({ entry: { 10: 4, 15: 3 }, zoneAt: {} });

    const events = service.detect([], window);
    const decan = events.find((event) => event.tags.includes("Decan"));
    const half = events.find((event) => event.tags.includes("Peak"));

    expect(decan?.tags).toStrictEqual([
      "Astronomy",
      "Astrology",
      "Ingress",
      "Decan",
      "Second Decan",
      "Sun",
      "Taurus",
    ]);
    expect(half?.tags).toStrictEqual([
      "Astronomy",
      "Astrology",
      "Ingress",
      "Peak",
      "After Peak",
      "Sun",
      "Taurus",
    ]);
    expect(decan?.summary).toMatch(/^☀️2️⃣♉︎ Sun in decan 2 Taurus$/u);
    expect(half?.summary).toMatch(/^☀️📉♉︎ Sun in second half of Taurus$/u);
  });

  it("drops a stay with no length, as when an ingress lands on the window start", () => {
    const clipped = moment.utc("2026-03-01T00:00:00.000Z");
    const signTransits = createMock<SignTransitsService>();
    signTransits.getZoneEntry.mockReturnValue({ index: 0, start: clipped });
    signTransits.getZoneExit.mockReturnValue(exitEnd);
    signTransits.getZoneAt.mockReturnValue(1);
    const clippedService = new IngressStaysService(
      new LoggerService(),
      signTransits,
    );

    const events = clippedService.detect(
      [
        ingress({
          body: "Sun",
          iso: "2026-03-01T00:00:00.000Z",
          kind: "Decan",
        }),
      ],
      window,
    );

    expect(staysOf(events, "Sun", "Decan")).toStrictEqual([
      [
        "Sun in decan 2 Aries",
        "2026-03-01T00:00:00.000Z",
        "2026-04-12T16:30:00.000Z",
      ],
    ]);
  });

  it("refuses a slice outside the zodiac", () => {
    const service = buildService({ entry: { 10: 99 }, zoneAt: {} });

    expect(() => service.detect([], window)).toThrow("not in the zodiac");
  });
});
