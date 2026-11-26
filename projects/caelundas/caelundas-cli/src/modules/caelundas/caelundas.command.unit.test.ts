import { createMock } from "@golevelup/ts-vitest";
import moment from "moment-timezone";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CalendarEventsService } from "../calendar-events/calendar-events.service";
import { EphemerisService } from "../ephemeris/ephemeris.service";
import { InputService } from "../input/input.service";
import { PerfectiveService } from "../perfective/perfective.service";
import { ProgressiveService } from "../progressive/progressive.service";

import { CaelundasCommand } from "./caelundas.command";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { Input } from "../input/input.types";

const input: Input = {
  end: moment.utc("2026-02-01T00:00:00Z"),
  latitude: 40.7128,
  longitude: -74.006,
  start: moment.utc("2026-01-01T00:00:00Z"),
  timezone: "America/New_York",
};

function detectedEvent(summary: string, start: string): DetectedCalendarEvent {
  return {
    description: summary,
    end: moment.utc(start),
    start: moment.utc(start),
    summary,
    tags: ["aspects"],
  };
}

describe(CaelundasCommand, () => {
  const callOrder: string[] = [];
  const calendarEventsService = createMock<CalendarEventsService>();
  const perfectiveService = createMock<PerfectiveService>();
  const progressiveService = createMock<ProgressiveService>();
  const inputService = createMock<InputService>();
  const ephemerisService = createMock<EphemerisService>();
  const testingModuleOptions = {
    providers: [
      { provide: InputService, useValue: inputService },
      { provide: PerfectiveService, useValue: perfectiveService },
      { provide: ProgressiveService, useValue: progressiveService },
      { provide: CalendarEventsService, useValue: calendarEventsService },
      { provide: EphemerisService, useValue: ephemerisService },
    ],
  };
  let command: CaelundasCommand;

  beforeAll(async () => {
    ({ instance: command } = await buildTestingModule(
      CaelundasCommand,
      testingModuleOptions,
    ));
  });

  beforeEach(() => {
    callOrder.length = 0;
    vi.clearAllMocks();
    ephemerisService.verifyFiles.mockReset();
    inputService.parse.mockReturnValue(input);
    perfectiveService.detect.mockImplementation(() => {
      callOrder.push("detect");
      return [
        detectedEvent("Later", "2026-01-20T00:00:00Z"),
        detectedEvent("Earlier", "2026-01-10T00:00:00Z"),
      ];
    });
    progressiveService.detect.mockReturnValue([
      detectedEvent("Middle", "2026-01-15T00:00:00Z"),
    ]);
    calendarEventsService.upsert.mockImplementation(async () => {
      callOrder.push("upsert");
      await Promise.resolve();
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      CaelundasCommand,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(CaelundasCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(CaelundasCommand, testingModuleOptions);
  });

  describe("run", () => {
    it("verifies the ephemeris files before it reads the input", async () => {
      await command.run();

      expect(ephemerisService.verifyFiles).toHaveBeenCalledWith();
      expect(
        ephemerisService.verifyFiles.mock.invocationCallOrder[0],
      ).toBeLessThan(inputService.parse.mock.invocationCallOrder[0] ?? 0);
    });

    it("stops before any work when the ephemeris files are missing", async () => {
      ephemerisService.verifyFiles.mockImplementationOnce(() => {
        throw new Error("Swiss Ephemeris files are missing");
      });

      await expect(command.run()).rejects.toThrow(
        "Swiss Ephemeris files are missing",
      );
      expect(inputService.parse).not.toHaveBeenCalled();
      expect(perfectiveService.detect).not.toHaveBeenCalled();
      expect(calendarEventsService.upsert).not.toHaveBeenCalled();
    });

    it("detects, then upserts", async () => {
      await command.run();

      expect(callOrder).toStrictEqual(["detect", "upsert"]);
    });

    it("upserts every detected event, sorted by start, for the input observer", async () => {
      await command.run();

      const [events, observer] =
        calendarEventsService.upsert.mock.calls[0] ?? [];

      expect(events?.map((event) => event.summary)).toStrictEqual([
        "Earlier",
        "Middle",
        "Later",
      ]);
      expect(observer).toStrictEqual({
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
      });
    });

    it("upserts an empty batch when nothing is detected", async () => {
      perfectiveService.detect.mockReturnValue([]);
      progressiveService.detect.mockReturnValue([]);

      await command.run();

      expect(calendarEventsService.upsert).toHaveBeenCalledExactlyOnceWith([], {
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
      });
    });
  });
});
