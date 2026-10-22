import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import _ from "lodash";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ProgressiveAspectService } from "./progressive-aspect.service";

import type { DetectedCalendarEvent } from "../database/database.types";
import type { DeepMocked } from "@golevelup/ts-vitest";

describe(ProgressiveAspectService, () => {
  let service: ProgressiveAspectService;
  let mockLoggerService: DeepMocked<LoggerService>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProgressiveAspectService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(ProgressiveAspectService);
    mockLoggerService = module.get(LoggerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("groups every event under a fixed key when one is supplied", () => {
    const makeEvent = (tag: string): DetectedCalendarEvent => ({
      description: tag,
      end: moment.utc("2024-03-21T00:00:00.000Z"),
      start: moment.utc("2024-03-21T00:00:00.000Z"),
      summary: tag,
      tags: ["Aspect", tag],
    });
    const pairProgressiveEvents = vi
      .fn<
        (
          beginnings: DetectedCalendarEvent[],
          endings: DetectedCalendarEvent[],
          label: string,
        ) => [DetectedCalendarEvent, DetectedCalendarEvent][]
      >()
      .mockReturnValue([]);

    service.buildSimpleAspectFamilyProgressiveEvents({
      aspectTag: "Aspect",
      events: [makeEvent("Forming"), makeEvent("Dissolving")],
      fixedAspectGroupKey: "fixed",
      getAspectGroupKey: (event) => event.summary,
      getProgressiveEvent: (beginning) => beginning,
      pairProgressiveEvents,
      tagLabel: "Simple",
    });

    expect(pairProgressiveEvents).toHaveBeenCalledTimes(1);
    expect(pairProgressiveEvents).toHaveBeenCalledWith(
      [expect.objectContaining({ summary: "Forming" })],
      [expect.objectContaining({ summary: "Dissolving" })],
      "Simple fixed",
    );
  });

  it("should build a stable group key", () => {
    expect(
      service.buildAspectGroupKeyFromTags({
        aspects: ["conjunct"],
        bodies: ["sun", "moon"],
        tags: ["Moon", "Conjunct", "Sun"],
      }),
    ).toBe("Moon-Conjunct-Sun");
  });

  it("should build a simple progressive event", () => {
    const beginning = {
      description: "Sun forming conjunct Moon",
      end: moment.utc("2024-03-21T12:00:00.000Z"),
      start: moment.utc("2024-03-21T12:00:00.000Z"),
      summary: "Sun conjunct Moon",
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Major Aspect",
        "Sun",
        "Moon",
        "Conjunct",
        "Forming",
      ],
    };
    const ending = {
      ...beginning,
      end: moment.utc("2024-03-21T13:00:00.000Z"),
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Major Aspect",
        "Sun",
        "Moon",
        "Conjunct",
        "Dissolving",
      ],
    };

    const event = service.createSimpleAspectProgressiveEvent({
      aspects: ["conjunct"],
      aspectTag: "Major Aspect",
      beginning,
      bodies: ["sun", "moon"],
      ending,
      isAspect: (value): value is "conjunct" => value === "conjunct",
      isBody: (value): value is "moon" | "sun" =>
        value === "sun" || value === "moon",
      symbolByAspect: { conjunct: "☌" },
      symbolByBody: { moon: "☾", sun: "☉" },
    });

    expect(event.tags).toContain("Major Aspect");
    expect(event.summary).toContain("☉");
    expect(event.summary).toContain("☾");
    expect(event.summary).toContain("☌");
  });

  it("should build progressive events from paired boundaries", () => {
    const forming = {
      description: "Sun forming conjunct Moon",
      end: moment.utc("2024-03-21T12:00:00.000Z"),
      start: moment.utc("2024-03-21T12:00:00.000Z"),
      summary: "Sun conjunct Moon",
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Major Aspect",
        "Sun",
        "Moon",
        "Conjunct",
        "Forming",
      ],
    };
    const dissolving = {
      ...forming,
      end: moment.utc("2024-03-21T13:00:00.000Z"),
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Major Aspect",
        "Sun",
        "Moon",
        "Conjunct",
        "Dissolving",
      ],
    };

    const events = service.buildProgressiveAspectEvents({
      aspectTag: "Major Aspect",
      events: [forming, dissolving],
      getAspectGroupKey: (event) =>
        service.buildAspectGroupKeyFromTags({
          aspects: ["conjunct"],
          bodies: ["sun", "moon"],
          tags: event.tags,
        }),
      getProgressiveEvent: (beginning, ending) =>
        service.createSimpleAspectProgressiveEvent({
          aspects: ["conjunct"],
          aspectTag: "Major Aspect",
          beginning,
          bodies: ["sun", "moon"],
          ending,
          isAspect: (value): value is "conjunct" => value === "conjunct",
          isBody: (value): value is "moon" | "sun" =>
            value === "sun" || value === "moon",
          symbolByAspect: { conjunct: "☌" },
          symbolByBody: { moon: "☾", sun: "☉" },
        }),
      pairProgressiveEvents: (beginnings, endings) => {
        const pairs = _.zip(beginnings, endings).filter(
          (
            pair,
          ): pair is [(typeof beginnings)[number], (typeof endings)[number]] =>
            pair[0] !== undefined && pair[1] !== undefined,
        );
        return pairs;
      },
      tagLabel: "major aspect",
    });

    expect(events).toHaveLength(1);
  });

  it("warns instead of silently skipping a group with an empty key", () => {
    const event = {
      description: "bodies with no match",
      end: moment.utc("2024-03-21T12:00:00.000Z"),
      start: moment.utc("2024-03-21T12:00:00.000Z"),
      summary: "bodies with no match",
      tags: ["Astronomy", "Major Aspect", "Forming"],
    };
    mockLoggerService.warn.mockClear();

    const events = service.buildProgressiveAspectEvents({
      aspectTag: "Major Aspect",
      events: [event],
      getAspectGroupKey: () => "",
      getProgressiveEvent: (beginning) => beginning,
      pairProgressiveEvents: () => [],
      tagLabel: "major aspect",
    });

    expect(events).toHaveLength(0);
    expect(mockLoggerService.warn).toHaveBeenCalledWith(
      expect.stringContaining("Skipping"),
      undefined,
      expect.objectContaining({ aspectTag: "Major Aspect", events: 1 }),
    );
  });

  describe("extractTypedAspectPartsOrThrow", () => {
    it("logs and throws with the original error preserved as cause", () => {
      const tags = ["Astronomy", "Astrology"];

      expect(() =>
        service.extractTypedAspectPartsOrThrow({
          aspects: ["conjunct"],
          bodies: ["sun", "moon"],
          errorMessage: "Could not extract typed values",
          isAspect: (value): value is "conjunct" => value === "conjunct",
          isBody: (value): value is "moon" | "sun" =>
            value === "sun" || value === "moon",
          tags,
        }),
      ).toThrow("Could not extract typed values");

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        "📐 Failed extracting typed aspect parts",
        undefined,
        {
          reason: expect.stringContaining(
            "Could not extract aspect info from tags",
          ) as string,
          tags,
        },
      );

      let thrownError: unknown;
      try {
        service.extractTypedAspectPartsOrThrow({
          aspects: ["conjunct"],
          bodies: ["sun", "moon"],
          errorMessage: "Could not extract typed values",
          isAspect: (value): value is "conjunct" => value === "conjunct",
          isBody: (value): value is "moon" | "sun" =>
            value === "sun" || value === "moon",
          tags,
        });
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(Error);
      expect((thrownError as Error).cause).toBeInstanceOf(Error);
    });

    it("stringifies a non-Error thrown value when logging the failure", () => {
      const tags = ["Astronomy", "Astrology"];
      const extractSpy = vi
        .spyOn(service, "extractTypedAspectParts")
        .mockImplementation(() => {
          throw "boom" as unknown as Error;
        });

      expect(() =>
        service.extractTypedAspectPartsOrThrow({
          aspects: ["conjunct"],
          bodies: ["sun", "moon"],
          errorMessage: "Could not extract typed values",
          isAspect: (value): value is "conjunct" => value === "conjunct",
          isBody: (value): value is "moon" | "sun" =>
            value === "sun" || value === "moon",
          tags,
        }),
      ).toThrow("Could not extract typed values");

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        "📐 Failed extracting typed aspect parts",
        undefined,
        { reason: "boom", tags },
      );

      extractSpy.mockRestore();
    });
  });
});
