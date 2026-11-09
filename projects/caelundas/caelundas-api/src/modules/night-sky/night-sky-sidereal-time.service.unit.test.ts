import { Test } from "@nestjs/testing";
import { SiderealTime } from "astronomy-engine";
import { beforeAll, describe, expect, it } from "vitest";

import { NightSkySiderealTimeService } from "./night-sky-sidereal-time.service";

const LONGITUDE = -74;

describe(NightSkySiderealTimeService, () => {
  let service: NightSkySiderealTimeService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [NightSkySiderealTimeService],
    }).compile();

    service = await module.resolve(NightSkySiderealTimeService);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  it("matches astronomy-engine to within a few seconds", () => {
    expect.hasAssertions();

    const instant = new Date("2026-10-20T01:00:00Z");

    expect(service.greenwichMeanHours(instant)).toBeCloseTo(
      SiderealTime(instant),
      2,
    );
  });

  it("keeps local sidereal time between 0 and 360 degrees", () => {
    expect.hasAssertions();

    const instant = new Date("2026-10-20T01:00:00Z");
    const west = service.localDegrees(instant, -300);
    const east = service.localDegrees(instant, 300);

    expect(west).toBeGreaterThanOrEqual(0);
    expect(west).toBeLessThan(360);
    expect(east).toBeGreaterThanOrEqual(0);
    expect(east).toBeLessThan(360);
  });

  it("starts the sky at astronomy-engine's local sidereal angle", () => {
    expect.hasAssertions();

    const instant = new Date("2026-10-20T01:00:00Z");

    expect(service.startingDegrees(instant, LONGITUDE)).toBeCloseTo(
      service.localDegrees(instant, LONGITUDE, SiderealTime(instant)),
      6,
    );
  });
});
