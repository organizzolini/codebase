import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AspectCalculationSupportService } from "./aspect-calculation-support.service";

import type { EphemerisService } from "../ephemeris/ephemeris.service";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";

describe(AspectCalculationSupportService, () => {
  let service: AspectCalculationSupportService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [AspectCalculationSupportService],
    }).compile();

    service = await module.resolve(AspectCalculationSupportService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("requires an ephemeris service to read a longitudes window", () => {
    const minute = moment.utc("2024-03-21T12:00:00.000Z");

    expect(() =>
      service.getLongitudesWindowForBody({
        body: "sun",
        coordinateEphemerisByBody: {} as never,
        minute,
        nextMinute: minute.clone().add(1, "minute"),
        previousMinute: minute.clone().subtract(1, "minute"),
      }),
    ).toThrow("EphemerisService is required for getLongitudesWindowForBody");
  });

  describe("getLongitudesWindowForBody caching", () => {
    const minute = moment.utc("2024-03-21T12:00:00.000Z");
    const request = {
      minute,
      nextMinute: minute.clone().add(1, "minute"),
      previousMinute: minute.clone().subtract(1, "minute"),
    };

    function buildService(): {
      getLongitudesWindow: ReturnType<
        typeof vi.fn<EphemerisService["getLongitudesWindow"]>
      >;
      support: AspectCalculationSupportService;
    } {
      const getLongitudesWindow = vi
        .fn<EphemerisService["getLongitudesWindow"]>()
        .mockReturnValue({ current: 10, next: 11, previous: 9 });
      const support = new AspectCalculationSupportService({
        getLongitudesWindow,
      } as unknown as EphemerisService);
      return { getLongitudesWindow, support };
    }

    const ephemerisByBody = {
      moon: {},
      sun: {},
    } as Record<"moon" | "sun", CoordinateEphemeris> as never;

    it("reads one body's window once however many pairs ask for it", () => {
      expect.hasAssertions();

      const { getLongitudesWindow, support } = buildService();

      const first = support.getLongitudesWindowForBody({
        body: "sun",
        coordinateEphemerisByBody: ephemerisByBody,
        ...request,
      });
      const second = support.getLongitudesWindowForBody({
        body: "sun",
        coordinateEphemerisByBody: ephemerisByBody,
        ...request,
      });

      expect(second).toStrictEqual(first);
      expect(getLongitudesWindow).toHaveBeenCalledTimes(1);
    });

    it("reads again for another body, another minute or another ephemeris", () => {
      expect.hasAssertions();

      const { getLongitudesWindow, support } = buildService();
      const later = {
        minute: minute.clone().add(1, "minute"),
        nextMinute: minute.clone().add(2, "minute"),
        previousMinute: minute.clone(),
      };

      support.getLongitudesWindowForBody({
        body: "sun",
        coordinateEphemerisByBody: ephemerisByBody,
        ...request,
      });
      support.getLongitudesWindowForBody({
        body: "moon",
        coordinateEphemerisByBody: ephemerisByBody,
        ...request,
      });
      support.getLongitudesWindowForBody({
        body: "sun",
        coordinateEphemerisByBody: ephemerisByBody,
        ...later,
      });
      support.getLongitudesWindowForBody({
        body: "sun",
        coordinateEphemerisByBody: {
          moon: {} as CoordinateEphemeris,
          sun: {} as CoordinateEphemeris,
        } as never,
        ...request,
      });

      expect(getLongitudesWindow).toHaveBeenCalledTimes(4);
    });
  });
});
