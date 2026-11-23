import { describe, expect, it, vi } from "vitest";

import { readNightSkyOverrides } from "../../../hooks/use-night-sky/use-night-sky.utilities";

import {
  applySkyLeaf,
  createSkyItems,
  toSkyValue,
} from "./calendar-display-sky.utilities";

const LISTING = [
  { name: "Aries", zodiac: true },
  { name: "Orion", zodiac: false },
];

describe("calendar-display-sky utilities", () => {
  describe(createSkyItems, () => {
    it("files the figures under the zodiac's and the others'", () => {
      const constellations = createSkyItems(LISTING).find(
        (item) => item.label === "Constellations",
      );
      const folder = (label: string): string[] =>
        constellations?.children
          ?.find((item) => item.label === label)
          ?.children?.map((item) => item.value) ?? [];

      expect(folder("Zodiac figures")).toStrictEqual(["constellation:Aries"]);
      expect(folder("Other figures")).toStrictEqual(["constellation:Orion"]);
    });

    it("offers each setting a few values, each color a few swatches", () => {
      const sky = createSkyItems(LISTING);
      const opacity = sky.find((item) => item.label === "Opacity");
      const background = sky.find((item) => item.label === "Background");
      const first = opacity?.children?.[0];

      expect(first?.children?.length).toBeGreaterThan(1);
      expect(first?.children?.[0]?.value).toMatch(/^setting:sky\.opacity=/u);
      expect(background?.children?.[0]?.children?.[0]?.icon).toBeDefined();
    });
  });

  describe(toSkyValue, () => {
    it("ticks the switches, the figures drawn, the nearest value and the swatch set", () => {
      const value = toSkyValue(
        readNightSkyOverrides({ "sky.top": "#04060f" }),
        LISTING,
      );

      expect(value).toContain("sky:visible");
      expect(value).toContain("sky:ecliptic");
      expect(value).toContain("constellation:Aries");
      expect(value).toContain("constellation:Orion");
      expect(value).toContain("setting:sky.top=#04060f");
      expect(
        value.some((leaf) => leaf.startsWith("setting:sky.opacity=")),
      ).toBe(true);
    });

    it("leaves out what is off", () => {
      const value = toSkyValue(
        readNightSkyOverrides({ sky: "off", "sky.ecliptic": false }),
        LISTING,
      );

      expect(value).not.toContain("sky:visible");
      expect(value).not.toContain("sky:ecliptic");
    });
  });

  describe(applySkyLeaf, () => {
    const settings = readNightSkyOverrides({});

    function apply(group: string, value: string): ReturnType<typeof vi.fn> {
      const onSkyChange = vi.fn<(change: unknown) => void>();

      applySkyLeaf(group, value, { listing: LISTING, onSkyChange, settings });

      return onSkyChange;
    }

    it("hides a figure that shows, naming the rest in the fewest words", () => {
      expect(apply("constellation", "Orion")).toHaveBeenCalledWith({
        "sky.constellations": "zodiac",
      });
    });

    it("sets a number as a number, and a color as it is", () => {
      expect(apply("setting", "sky.lat=45")).toHaveBeenCalledWith({
        "sky.lat": 45,
      });
      expect(apply("setting", "sky.top=#ffffff")).toHaveBeenCalledWith({
        "sky.top": "#ffffff",
      });
    });

    it("puts the sky back to its default", () => {
      expect(apply("sky", "reset")).toHaveBeenCalledWith(
        expect.objectContaining({ "sky.lat": undefined }),
      );
    });

    it("ignores a setting it does not know", () => {
      expect(apply("setting", "sky.narnia=1")).not.toHaveBeenCalled();
    });
  });
});
