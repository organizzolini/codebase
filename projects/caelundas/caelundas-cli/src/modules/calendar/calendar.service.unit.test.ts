import moment from "moment-timezone";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CalendarService } from "./calendar.service";

describe(CalendarService, () => {
  let service: CalendarService;
  const testingModuleOptions = {
    providers: [{ provide: LoggerService, useValue: new LoggerService() }],
  };

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(
      CalendarService,
      testingModuleOptions,
    ));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      CalendarService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(CalendarService);
  });

  describe("buildInstantEvent", () => {
    const date = moment.utc("2025-03-20T09:06:00Z");

    it("builds an event whose start and end are the same instant", () => {
      const event = service.buildInstantEvent({
        date,
        description: "Sun ingress Aries",
        logger: { info: vi.fn<() => void>() },
        summary: "Sun ingress Aries",
        tags: ["Ingress"],
        timezone: "America/New_York",
      });

      expect(event).toStrictEqual({
        description: "Sun ingress Aries",
        end: date,
        start: date,
        summary: "Sun ingress Aries",
        tags: ["Ingress"],
      });
    });

    it("logs the instant in the observer's timezone", () => {
      const info = vi.fn<() => void>();

      service.buildInstantEvent({
        date,
        description: "Full Moon",
        logger: { info },
        summary: "Full Moon",
        tags: [],
        timezone: "America/New_York",
      });

      expect(info).toHaveBeenCalledWith(
        "🗓️ Built a calendar event",
        undefined,
        { at: "2025-03-20T05:06:00.000-04:00", summary: "Full Moon" },
      );
    });
  });
});
