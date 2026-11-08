import { describe, expect, it } from "vitest";

import { resolveOptions } from "./night-sky-options.utilities";
import { DEFAULT_OPTIONS } from "./night-sky.constants";

describe("night sky options suite", () => {
  const required = {
    height: 700,
    latitudeDegrees: 40,
    localSiderealDegrees: 10,
    stars: [],
    width: 1100,
  } as const;

  it("fills every option left out with its default", () => {
    expect.hasAssertions();

    expect(resolveOptions(required)).toStrictEqual({
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

    expect(resolveOptions(given)).toStrictEqual(given);
  });
});
