import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

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
      'viewBox="0 0 800 600"',
    );
  });

  it("refuses input the builder cannot draw", () => {
    expect.hasAssertions();

    expect(() => service.build({ height: 0, width: 800 })).toThrow("height");
  });
});
