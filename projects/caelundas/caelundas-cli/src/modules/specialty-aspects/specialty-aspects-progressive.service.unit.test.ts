import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import _ from "lodash";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ProgressiveAspectService } from "../progressive/progressive-aspect.service";
import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import { SpecialtyAspectsProgressiveService } from "./specialty-aspects-progressive.service";

import type { DetectedCalendarEvent } from "../database/database.types";

describe(SpecialtyAspectsProgressiveService, () => {
  let service: SpecialtyAspectsProgressiveService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SpecialtyAspectsProgressiveService,
        ProgressiveAspectService,
        {
          provide: ProgressiveUtilitiesService,
          useValue: createMock<ProgressiveUtilitiesService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SpecialtyAspectsProgressiveService);
  });

  const progressiveUtilitiesService = {
    pairProgressiveEvents:
      vi.fn<ProgressiveUtilitiesService["pairProgressiveEvents"]>(),
  };

  const mockService = new SpecialtyAspectsProgressiveService(
    new ProgressiveAspectService(createMock<LoggerService>()),
    progressiveUtilitiesService as never,
  );
  const specialtyAspectsProgressiveService = mockService as unknown as {
    extractTypedAspectValues: (args: {
      aspectCapitalized: string;
      body1Capitalized: string;
      body2Capitalized: string;
      tags: string[];
    }) => { aspect: string; body1: string; body2: string };
    getSpecialtyAspectProgressiveEvent: (
      beginning: DetectedCalendarEvent,
      ending: DetectedCalendarEvent,
    ) => DetectedCalendarEvent;
    processAspectGroup: (
      aspectGroupKey: string,
      aspectGroupEvents: DetectedCalendarEvent[],
    ) => DetectedCalendarEvent[];
    specialtyAspectGroupKey: (event: DetectedCalendarEvent) => string;
  };

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("returns an empty group key for incomplete tags", () => {
    expect(
      specialtyAspectsProgressiveService.specialtyAspectGroupKey({
        description: "Incomplete tags",
        end: moment.utc("2024-03-21T10:00:00.000Z"),
        start: moment.utc("2024-03-21T10:00:00.000Z"),
        summary: "Incomplete tags",
        tags: ["Astronomy", "Astrology"],
      }),
    ).toBe("");
  });

  it("returns an empty array for an empty progressive group key", () => {
    expect(
      specialtyAspectsProgressiveService.processAspectGroup("", []),
    ).toStrictEqual([]);
  });

  it("throws when tags do not include a complete specialty aspect", () => {
    expect(() =>
      specialtyAspectsProgressiveService.getSpecialtyAspectProgressiveEvent(
        {
          description: "Invalid beginning",
          end: moment.utc("2024-03-21T10:00:00.000Z"),
          start: moment.utc("2024-03-21T10:00:00.000Z"),
          summary: "Invalid beginning",
          tags: ["Astronomy", "Astrology", "Specialty Aspect", "Sun"],
        },
        {
          description: "Invalid ending",
          end: moment.utc("2024-03-21T11:00:00.000Z"),
          start: moment.utc("2024-03-21T11:00:00.000Z"),
          summary: "Invalid ending",
          tags: ["Astronomy", "Astrology", "Specialty Aspect", "Sun"],
        },
      ),
    ).toThrow("Could not extract aspect info from tags");
  });

  it("throws when extracted specialty values cannot be cast to typed values", () => {
    expect(() =>
      specialtyAspectsProgressiveService.extractTypedAspectValues({
        aspectCapitalized: "Not Specialty",
        body1Capitalized: "Sun",
        body2Capitalized: "Moon",
        tags: ["Not Specialty", "Sun", "Moon"],
      }),
    ).toThrow("Could not extract typed values from tags");
  });

  it("falls back to empty body strings when sorted bodies include undefined", () => {
    const sortBySpy = vi
      .spyOn(_, "sortBy")
      .mockReturnValue([undefined, "Moon"] as unknown);

    expect(() =>
      specialtyAspectsProgressiveService.getSpecialtyAspectProgressiveEvent(
        {
          description: "invalid beginning",
          end: moment.utc("2024-03-21T10:00:00.000Z"),
          start: moment.utc("2024-03-21T10:00:00.000Z"),
          summary: "invalid beginning",
          tags: [
            "Astronomy",
            "Astrology",
            "Simple Aspect",
            "Specialty Aspect",
            "Sun",
            "Moon",
            "Quintile",
            "Forming",
          ],
        },
        {
          description: "invalid ending",
          end: moment.utc("2024-03-21T11:00:00.000Z"),
          start: moment.utc("2024-03-21T11:00:00.000Z"),
          summary: "invalid ending",
          tags: [
            "Astronomy",
            "Astrology",
            "Simple Aspect",
            "Specialty Aspect",
            "Sun",
            "Moon",
            "Quintile",
            "Dissolving",
          ],
        },
      ),
    ).toThrow("Could not extract typed values from tags");

    sortBySpy.mockRestore();
  });

  it("falls back when the second sorted body is undefined", () => {
    const sortBySpy = vi
      .spyOn(_, "sortBy")
      .mockReturnValue(["Moon", undefined] as unknown);

    expect(() =>
      specialtyAspectsProgressiveService.getSpecialtyAspectProgressiveEvent(
        {
          description: "invalid beginning",
          end: moment.utc("2024-03-21T10:00:00.000Z"),
          start: moment.utc("2024-03-21T10:00:00.000Z"),
          summary: "invalid beginning",
          tags: [
            "Astronomy",
            "Astrology",
            "Simple Aspect",
            "Specialty Aspect",
            "Sun",
            "Moon",
            "Quintile",
            "Forming",
          ],
        },
        {
          description: "invalid ending",
          end: moment.utc("2024-03-21T11:00:00.000Z"),
          start: moment.utc("2024-03-21T11:00:00.000Z"),
          summary: "invalid ending",
          tags: [
            "Astronomy",
            "Astrology",
            "Simple Aspect",
            "Specialty Aspect",
            "Sun",
            "Moon",
            "Quintile",
            "Dissolving",
          ],
        },
      ),
    ).toThrow("Could not extract typed values from tags");

    sortBySpy.mockRestore();
  });

  it("creates progressive events from grouped forming and dissolving events", () => {
    progressiveUtilitiesService.pairProgressiveEvents.mockReturnValueOnce([
      [
        {
          description: "Sun quintile Moon",
          end: moment.utc("2024-03-21T10:00:00.000Z"),
          start: moment.utc("2024-03-21T10:00:00.000Z"),
          summary: "⬠ Sun quintile Moon",
          tags: [
            "Astronomy",
            "Astrology",
            "Simple Aspect",
            "Specialty Aspect",
            "Sun",
            "Moon",
            "Quintile",
            "Forming",
          ],
        },
        {
          description: "Sun quintile Moon",
          end: moment.utc("2024-03-21T11:00:00.000Z"),
          start: moment.utc("2024-03-21T11:00:00.000Z"),
          summary: "⬠ Sun quintile Moon",
          tags: [
            "Astronomy",
            "Astrology",
            "Simple Aspect",
            "Specialty Aspect",
            "Sun",
            "Moon",
            "Quintile",
            "Dissolving",
          ],
        },
      ],
    ]);

    const progressiveEvents = mockService.detectProgressive([
      {
        description: "Sun quintile Moon",
        end: moment.utc("2024-03-21T10:00:00.000Z"),
        start: moment.utc("2024-03-21T10:00:00.000Z"),
        summary: "⬠ Sun quintile Moon",
        tags: [
          "Astronomy",
          "Astrology",
          "Simple Aspect",
          "Specialty Aspect",
          "Sun",
          "Moon",
          "Quintile",
          "Forming",
        ],
      },
      {
        description: "Sun quintile Moon",
        end: moment.utc("2024-03-21T11:00:00.000Z"),
        start: moment.utc("2024-03-21T11:00:00.000Z"),
        summary: "⬠ Sun quintile Moon",
        tags: [
          "Astronomy",
          "Astrology",
          "Simple Aspect",
          "Specialty Aspect",
          "Sun",
          "Moon",
          "Quintile",
          "Dissolving",
        ],
      },
    ]);

    expect(
      progressiveUtilitiesService.pairProgressiveEvents,
    ).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(Object)]),
      expect.arrayContaining([expect.any(Object)]),
      expect.stringContaining("specialty aspect"),
    );
    expect(progressiveEvents).toHaveLength(1);
    expect(progressiveEvents[0]?.description).toBe("Moon quintile Sun");
    expect(progressiveEvents[0]?.summary).toContain("Moon quintile Sun");
  });
});
