import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { AspectCalculationSupportService } from "./aspect-calculation-support.service";

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
});
