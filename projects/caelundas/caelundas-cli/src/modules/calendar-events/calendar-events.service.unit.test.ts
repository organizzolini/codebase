import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { CalendarEvent } from "../database/entities/calendar-event.entity";
import { TagsService } from "../tags/tags.service";
import { tagPathKey } from "../tags/tags.utilities";

import { CalendarEventsService } from "./calendar-events.service";

import type { TagPath } from "../tags/tags.types";

describe(CalendarEventsService, () => {
  let service: CalendarEventsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CalendarEventsService,
        LoggerService,
        TagsService,
        { provide: getRepositoryToken(CalendarEvent), useValue: {} },
      ],
    }).compile();

    service = await module.resolve(CalendarEventsService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("formatCoordinate", () => {
    it("rounds to the six decimals the column stores", () => {
      expect(service.formatCoordinate(39.949_309_4)).toBe("39.949309");
    });

    it("pads a short coordinate to six decimals", () => {
      expect(service.formatCoordinate(-75.5)).toBe("-75.500000");
    });
  });

  describe("tidyText", () => {
    it("trims the ends and collapses runs of whitespace", () => {
      expect(service.tidyText("  ☀️☌🌙   Sun conjunct  Moon ")).toBe(
        "☀️☌🌙 Sun conjunct Moon",
      );
    });

    it("leaves tidy text alone", () => {
      expect(service.tidyText("☀️☌🌙 Sun conjunct Moon")).toBe(
        "☀️☌🌙 Sun conjunct Moon",
      );
    });
  });

  describe("calendarEventKey", () => {
    it("keys a moment and a date at the same instant alike", () => {
      const start = "2026-01-10T00:00:00.000Z";

      expect(
        service.calendarEventKey(
          "Sunrise",
          moment.utc(start),
          moment.utc(start),
        ),
      ).toBe(
        service.calendarEventKey("Sunrise", new Date(start), new Date(start)),
      );
    });

    it("tells a span from a boundary of the same title and start", () => {
      const start = new Date("2026-01-10T00:00:00.000Z");
      const end = new Date("2026-01-12T00:00:00.000Z");

      expect(
        service.calendarEventKey("Mars trine Venus", start, start),
      ).not.toBe(service.calendarEventKey("Mars trine Venus", start, end));
    });
  });

  describe("mapWrittenIds", () => {
    const start = moment.utc("2026-01-10T00:00:00Z");
    const end = moment.utc("2026-01-12T00:00:00Z");
    let sunrise = "";
    let sunset = "";
    let mars = "";

    beforeAll(() => {
      sunrise = service.calendarEventKey("Sunrise", start, start);
      sunset = service.calendarEventKey("Sunset", start, start);
      mars = service.calendarEventKey("Mars trine Venus", start, end);
    });

    it("keys each id by the summary, start and end read back with it", () => {
      expect(
        service.mapWrittenIds(
          [
            { end: start, id: "b", start, summary: "Sunset" },
            { end: start, id: "a", start, summary: "Sunrise" },
            { end, id: "c", start, summary: "Mars trine Venus" },
          ],
          new Set([mars, sunrise, sunset]),
        ),
      ).toStrictEqual(
        new Map([
          [mars, "c"],
          [sunrise, "a"],
          [sunset, "b"],
        ]),
      );
    });

    it("leaves out a stored neighbor the batch did not write", () => {
      expect(
        service.mapWrittenIds(
          [
            { end: start, id: "a", start, summary: "Sunrise" },
            { end: start, id: "b", start, summary: "Sunset" },
          ],
          new Set([sunrise]),
        ),
      ).toStrictEqual(new Map([[sunrise, "a"]]));
    });
  });

  describe("toTagLinks", () => {
    const event = {
      description: "Sunrise description",
      end: moment.utc("2026-01-10T00:00:00Z"),
      start: moment.utc("2026-01-10T00:00:00Z"),
      summary: "Sunrise",
      tags: ["Sun"],
    };
    const planet: TagPath = ["Planet", "Sun"];
    const type: TagPath = ["Type", "Cycle", "Daily Solar Cycle"];
    const classified = { event, paths: [planet, type, planet] };
    const tagIds = new Map([
      [tagPathKey(planet), "sun"],
      [tagPathKey(type), "cycle"],
    ]);

    it("links each event to the node of each of its paths once", () => {
      expect(
        service.toTagLinks(
          [["key", classified]],
          new Map([["key", "event"]]),
          tagIds,
        ),
      ).toStrictEqual([
        { calendarEventId: "event", tagId: "sun" },
        { calendarEventId: "event", tagId: "cycle" },
      ]);
    });

    it("throws for a path no node was resolved for", () => {
      expect(() =>
        service.toTagLinks(
          [["key", classified]],
          new Map([["key", "event"]]),
          new Map([[tagPathKey(planet), "sun"]]),
        ),
      ).toThrow(/Daily Solar Cycle/u);
    });

    it("throws for an event no id was read back for", () => {
      expect(() =>
        service.toTagLinks([["key", classified]], new Map(), tagIds),
      ).toThrow(/Sunrise/u);
    });
  });
});
