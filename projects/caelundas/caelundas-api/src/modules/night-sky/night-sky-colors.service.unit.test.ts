import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { NightSkyColorsService } from "./night-sky-colors.service";

describe(NightSkyColorsService, () => {
  let service: NightSkyColorsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [NightSkyColorsService],
    }).compile();

    service = await module.resolve(NightSkyColorsService);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  describe("readColor", () => {
    it("reads three or six digits, with or without the #, as #rrggbb", () => {
      expect.hasAssertions();

      expect(service.readColor("#ABC", "#000000")).toBe("#aabbcc");
      expect(service.readColor("a0b1c2", "#000000")).toBe("#a0b1c2");
    });

    it("answers the fallback for anything else", () => {
      expect.hasAssertions();

      expect(service.readColor("red", "#123456")).toBe("#123456");
      expect(service.readColor(100_000, "#123456")).toBe("#123456");
    });
  });

  describe("formatSkyDefinitions", () => {
    it("writes the gradient between the two colors and the star glow", () => {
      expect.hasAssertions();

      const markup = service.formatSkyDefinitions("#112233", "#445566");

      expect(markup).toContain('offset="0" stop-color="#112233"');
      expect(markup).toContain('offset="1" stop-color="#445566"');
      expect(markup).toContain('id="star-glow"');
    });
  });
});
