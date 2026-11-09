import { Test } from "@nestjs/testing";
import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  type Constellation,
  type ConstellationLine,
  Star,
} from "@codebase/caelundas-db";

import { NIGHT_SKY_CACHE_SIZE } from "./night-sky.constants";
import { NightSkyService } from "./night-sky.service";

// 🌟 Fixtures

/** Stars out of brightness order, as a database may hand them back. */
const DUBHE: Star = {
  colorIndex: 0.6,
  declinationDegrees: 61.7,
  hip: 54_061,
  magnitude: 1.8,
  rightAscensionHours: 11.06,
};

const ALIOTH: Star = {
  colorIndex: 0.3,
  declinationDegrees: 56.4,
  hip: 62_956,
  magnitude: 1.77,
  rightAscensionHours: 12.9,
};

const STARS: Star[] = [
  {
    colorIndex: 1.2,
    declinationDegrees: 19.2,
    hip: 69_673,
    magnitude: -0.05,
    rightAscensionHours: 14.26,
  },
  {
    colorIndex: 0,
    declinationDegrees: -16.7,
    hip: 32_349,
    magnitude: -1.46,
    rightAscensionHours: 6.75,
  },
  DUBHE,
  ALIOTH,
];

const URSA_MAJOR: Constellation = {
  designation: "UMa",
  name: "Ursa Major",
  zodiac: false,
};

const LINES: ConstellationLine[] = [
  {
    constellation: URSA_MAJOR,
    constellationDesignation: "UMa",
    fromHip: 54_061,
    fromStar: DUBHE,
    toHip: 62_956,
    toStar: ALIOTH,
  },
];

/** Answers a read of stars or of figure lines with the fixtures above. */
const manager = {
  getRepository: (target: unknown) => ({
    find: vi
      .fn<() => Promise<unknown[]>>()
      .mockResolvedValue(target === Star ? STARS : LINES),
  }),
};

describe(NightSkyService, () => {
  let service: NightSkyService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NightSkyService,
        { provide: getEntityManagerToken(), useValue: manager },
      ],
    }).compile();

    service = await module.resolve(NightSkyService);
    await service.onModuleInit();
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  it("loads the stars from the database as rows, brightest first", () => {
    expect.hasAssertions();

    expect(service.catalog.stars).toStrictEqual([
      [6.75, -16.7, -1.46, 0],
      [14.26, 19.2, -0.05, 1.2],
      [12.9, 56.4, 1.77, 0.3],
      [11.06, 61.7, 1.8, 0.6],
    ]);
  });

  it("loads the constellation figures from the database as segments", () => {
    expect.hasAssertions();

    expect(service.catalog.segments).toStrictEqual([
      {
        from: [11.06, 61.7],
        name: "Ursa Major",
        to: [12.9, 56.4],
        zodiac: false,
      },
    ]);
  });

  it("refuses to hand out a catalog before it is loaded", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        NightSkyService,
        { provide: getEntityManagerToken(), useValue: manager },
      ],
    }).compile();
    const fresh = await module.resolve(NightSkyService);

    expect(() => fresh.catalog).toThrow("not loaded");
  });

  it("builds a sky from the loaded catalog", () => {
    expect.hasAssertions();

    expect(service.build({ height: 600, width: 800 }).svg).toContain(
      'viewBox="0 0 832 640"',
    );
  });

  it("refuses input the builder cannot draw", () => {
    expect.hasAssertions();

    expect(() => service.build({ height: 0, width: 800 })).toThrow("height");
  });

  it("hands back the same sky for requests that name the same canonical sky", () => {
    expect.hasAssertions();

    const first = service.build({
      height: 690,
      time: new Date("2026-03-20T04:30:01Z"),
      width: 1090,
    });
    const second = service.build({
      constellations: ["zodiac"],
      height: 700,
      time: new Date("2026-03-20T04:30:59Z"),
      width: 1100,
    });

    expect(second).toBe(first);
  });

  it("forgets the least recently used sky once the cache is full", () => {
    expect.hasAssertions();

    const oldest = service.build({ height: 64, width: 64 });

    for (
      let width = 128;
      width < 128 + NIGHT_SKY_CACHE_SIZE * 64;
      width += 64
    ) {
      service.build({ height: 64, width });
    }

    expect(service.build({ height: 64, width: 64 })).not.toBe(oldest);
  });

  it("keeps a sky that is used again", () => {
    expect.hasAssertions();

    const kept = service.build({ height: 64, width: 8192 });

    for (
      let width = 64;
      width < (NIGHT_SKY_CACHE_SIZE + 10) * 64;
      width += 64
    ) {
      service.build({ height: 128, width });
      service.build({ height: 64, width: 8192 });
    }

    expect(service.build({ height: 64, width: 8192 })).toBe(kept);
  });
});
