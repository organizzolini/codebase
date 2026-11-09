import { createMock } from "@golevelup/ts-vitest";
import _ from "lodash";
import moment from "moment-timezone";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProgressiveAspectService } from "../progressive/progressive-aspect.service";
import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import { MinorAspectsProgressiveService } from "./minor-aspects-progressive.service";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { LoggerService } from "@codebase/observability";

describe(MinorAspectsProgressiveService, () => {
  const testingModuleOptions = {
    mocks: [ProgressiveUtilitiesService],
    providers: [ProgressiveAspectService],
  };

  const progressiveUtilitiesService = {
    pairProgressiveEvents:
      vi.fn<ProgressiveUtilitiesService["pairProgressiveEvents"]>(),
  };
  const mockService = new MinorAspectsProgressiveService(
    new ProgressiveAspectService(createMock<LoggerService>()),
    progressiveUtilitiesService as never,
  );
  const privateService = mockService as unknown as {
    castAspectComponentsToTypes: (args: {
      aspectCapitalized: string;
      body1Capitalized: string;
      body2Capitalized: string;
      tags: string[];
    }) => { aspect: string; body1: string; body2: string };
    getMinorAspectProgressiveEvent: (
      beginning: DetectedCalendarEvent,
      ending: DetectedCalendarEvent,
    ) => DetectedCalendarEvent;
    processAspectGroup: (
      aspectGroupKey: string,
      aspectGroupEvents: DetectedCalendarEvent[],
    ) => DetectedCalendarEvent[];
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      MinorAspectsProgressiveService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(MinorAspectsProgressiveService);
  });

  it("builds progressive events from forming and dissolving minor aspects", () => {
    const formingEvent: DetectedCalendarEvent = {
      description: "Sun forming semisquare Moon",
      end: moment.utc("2024-03-21T10:00:00.000Z"),
      start: moment.utc("2024-03-21T10:00:00.000Z"),
      summary: "☀️∠🌙 Sun semisquare Moon",
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Minor Aspect",
        "Sun",
        "Moon",
        "Semisquare",
        "Forming",
      ],
    };
    const dissolvingEvent: DetectedCalendarEvent = {
      description: "Sun dissolving semisquare Moon",
      end: moment.utc("2024-03-21T14:00:00.000Z"),
      start: moment.utc("2024-03-21T14:00:00.000Z"),
      summary: "☀️∠🌙 Sun semisquare Moon",
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Minor Aspect",
        "Sun",
        "Moon",
        "Semisquare",
        "Dissolving",
      ],
    };

    progressiveUtilitiesService.pairProgressiveEvents.mockReturnValueOnce([
      [formingEvent, dissolvingEvent],
    ]);

    const progressiveEvents = mockService.detectProgressive([
      formingEvent,
      dissolvingEvent,
    ]);

    expect(progressiveEvents).toHaveLength(1);
    expect(progressiveEvents[0]?.description).toBe("Sun semisquare Moon");
    expect(progressiveEvents[0]?.summary).toBe(formingEvent.summary);
  });

  it("returns empty when aspect group key is empty", () => {
    expect(privateService.processAspectGroup("", [])).toStrictEqual([]);
  });

  it("returns empty key for invalid tags", () => {
    expect(
      mockService.buildGroupKey({
        description: "invalid",
        end: moment.utc("2024-03-21T10:00:00.000Z"),
        start: moment.utc("2024-03-21T10:00:00.000Z"),
        summary: "invalid",
        tags: ["Astronomy", "Astrology", "Minor Aspect"],
      }),
    ).toBe("");
  });

  it("throws when tags do not contain a complete minor aspect", () => {
    const invalidEvent: DetectedCalendarEvent = {
      description: "invalid",
      end: moment.utc("2024-03-21T10:00:00.000Z"),
      start: moment.utc("2024-03-21T10:00:00.000Z"),
      summary: "invalid",
      tags: ["Astronomy", "Minor Aspect", "Sun"],
    };

    expect(() =>
      privateService.getMinorAspectProgressiveEvent(invalidEvent, invalidEvent),
    ).toThrow("Could not extract aspect info from tags");
  });

  it("throws when type casting receives invalid minor-aspect values", () => {
    expect(() =>
      privateService.castAspectComponentsToTypes({
        aspectCapitalized: "Invalid Aspect",
        body1Capitalized: "Invalid Body",
        body2Capitalized: "Moon",
        tags: ["Invalid Aspect", "Invalid Body", "Moon"],
      }),
    ).toThrow("Could not extract typed values from tags");
  });

  it("handles undefined sorted body entries before type casting", () => {
    const sortBySpy = vi
      .spyOn(_, "sortBy")
      .mockReturnValue([undefined, "Moon"] as unknown);
    const invalidEvent: DetectedCalendarEvent = {
      description: "invalid",
      end: moment.utc("2024-03-21T10:00:00.000Z"),
      start: moment.utc("2024-03-21T10:00:00.000Z"),
      summary: "invalid",
      tags: ["Astronomy", "Astrology", "Minor Aspect", "Semisquare", "Moon"],
    };

    expect(() =>
      privateService.getMinorAspectProgressiveEvent(invalidEvent, invalidEvent),
    ).toThrow("Could not extract typed values from tags");

    sortBySpy.mockRestore();
  });

  it("handles undefined second sorted body entry before type casting", () => {
    const sortBySpy = vi
      .spyOn(_, "sortBy")
      .mockReturnValue(["Moon", undefined] as unknown);
    const invalidEvent: DetectedCalendarEvent = {
      description: "invalid",
      end: moment.utc("2024-03-21T10:00:00.000Z"),
      start: moment.utc("2024-03-21T10:00:00.000Z"),
      summary: "invalid",
      tags: ["Astronomy", "Astrology", "Minor Aspect", "Semisquare", "Moon"],
    };

    expect(() =>
      privateService.getMinorAspectProgressiveEvent(invalidEvent, invalidEvent),
    ).toThrow("Could not extract typed values from tags");

    sortBySpy.mockRestore();
  });
});
