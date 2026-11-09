import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { NightSkyOptionsService } from "./night-sky-options.service";
import { DEFAULT_OPTIONS } from "./night-sky.constants";

describe(NightSkyOptionsService, () => {
  let service: NightSkyOptionsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [NightSkyOptionsService],
    }).compile();

    service = await module.resolve(NightSkyOptionsService);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  const required = {
    height: 700,
    latitudeDegrees: 40,
    localSiderealDegrees: 10,
    stars: [],
    width: 1100,
  } as const;

  it("fills every option left out with its default", () => {
    expect.hasAssertions();

    expect(service.withDefaults(required)).toStrictEqual({
      ...DEFAULT_OPTIONS,
      ...required,
      constellationSegments: [],
    });
  });

  it("keeps every option the caller gives", () => {
    expect.hasAssertions();

    const given = {
      ...required,
      backgroundBottomColor: "#111111",
      backgroundTopColor: "#222222",
      bottomAltitudeDegrees: 5,
      constellationSegments: [],
      debug: true,
      ecliptic: false,
      eclipticColor: "#333333",
      eclipticOpacity: 0.5,
      eclipticWidth: 2,
      faintestMagnitude: 4,
      lineColor: "#444444",
      lineOpacity: 0.6,
      lineWidth: 3,
      pixelsPerSecond: 9,
      starScale: 2,
      still: true,
      verticalFieldOfViewDegrees: 30,
    };

    expect(service.withDefaults(given)).toStrictEqual(given);
  });
});
