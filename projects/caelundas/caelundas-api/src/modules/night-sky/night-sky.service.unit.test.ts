import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { NIGHT_SKY_CACHE_SIZE } from "./night-sky.constants";
import { NightSkyService } from "./night-sky.service";

describe(NightSkyService, () => {
  let service: NightSkyService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [NightSkyService],
    }).compile();

    service = await module.resolve(NightSkyService);
    await service.onModuleInit();
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  it("loads the stars sorted brightest first", () => {
    expect.hasAssertions();

    const magnitudes = service.catalog.stars.map((star) => star[2]);

    expect(magnitudes.length).toBeGreaterThan(0);
    expect(magnitudes).toStrictEqual(magnitudes.toSorted((a, b) => a - b));
  });

  it("loads the constellation figures", () => {
    expect.hasAssertions();

    const names = new Set(service.catalog.segments.map(({ name }) => name));

    expect(names).toContain("Ursa Major");
  });

  it("refuses to hand out a catalog before it is loaded", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [NightSkyService],
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
