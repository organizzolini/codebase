import moment from "moment-timezone";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CalendarService } from "./calendar.service";

describe(CalendarService, () => {
  let service: CalendarService;
  const logger = new LoggerService();
  const testingModuleOptions = {
    providers: [{ provide: LoggerService, useValue: logger }],
  };

  beforeAll(async () => {
    const { instance } = await buildTestingModule(
      CalendarService,
      testingModuleOptions,
    );

    service = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      CalendarService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(CalendarService);
  });

  describe("buildInstantEvent", () => {
    const date = moment.utc("2026-03-20T09:06:00Z");

    it("builds an event whose start and end are the same instant", () => {
      const info = vi.fn<(message: string) => void>();

      const event = service.buildInstantEvent({
        date,
        description: "A description",
        logger: { info },
        summary: "A summary",
        tags: ["ingress"],
        timezone: "America/New_York",
      });

      expect(event).toStrictEqual({
        description: "A description",
        end: date,
        start: date,
        summary: "A summary",
        tags: ["ingress"],
      });
    });

    it("logs the instant in the event's timezone", () => {
      const info = vi.fn<(message: string) => void>();

      service.buildInstantEvent({
        date,
        description: "A description",
        logger: { info },
        summary: "A summary",
        tags: [],
        timezone: "America/New_York",
      });

      expect(info).toHaveBeenCalledExactlyOnceWith(
        "🗓️ Built a calendar event",
        undefined,
        { at: "2026-03-20T05:06:00.000-04:00", summary: "A summary" },
      );
    });
  });
});
