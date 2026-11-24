import { describe, expect, it, vi } from "vitest";

import { readNightSkyOverrides } from "../../../hooks/use-night-sky/use-night-sky.utilities";

import {
  applyDisplayLeaf,
  createDisplayItems,
  describeConstellations,
  findToggledLeaf,
  toDisplayValue,
} from "./calendar-display-menu.utilities";

import type { UseCalendarDisplayResult } from "../../../hooks/use-calendar-display/use-calendar-display.types";
import type { DisplayChoices } from "./calendar-display-menu.types";

const LISTING = [
  { name: "Aries", zodiac: true },
  { name: "Orion", zodiac: false },
];
const CHOICES: DisplayChoices = {
  clusters: true,
  colors: true,
  listing: LISTING,
  scale: "month",
  sky: readNightSkyOverrides({}),
  symbols: "glyphs",
  view: "timeline",
};

/**
 * Applies a leaf against the choices, returning what was called.
 */
function apply(
  leaf: string,
  choices: DisplayChoices = CHOICES,
): {
  handlers: UseCalendarDisplayResult["handlers"];
  onSkyChange: ReturnType<typeof vi.fn<(change: unknown) => void>>;
} {
  const handlers = createHandlers();
  const onSkyChange = vi.fn<(change: unknown) => void>();

  applyDisplayLeaf(leaf, { choices, handlers, onSkyChange });

  return { handlers, onSkyChange };
}

/**
 * The handlers a leaf may call, each a spy.
 */
function createHandlers(): UseCalendarDisplayResult["handlers"] {
  return {
    handleClustersChange: vi.fn<(enabled: boolean) => void>(),
    handleColorsChange: vi.fn<(enabled: boolean) => void>(),
    handleScaleChange: vi.fn<() => void>(),
    handleSymbolsChange: vi.fn<() => void>(),
    handleViewChange: vi.fn<() => void>(),
  };
}

describe("calendar-display-menu utilities", () => {
  describe(createDisplayItems, () => {
    it("offers Layout, Symbols, Colors, Crowded days and Sky, with a Scale only on the timeline", () => {
      const labels = (view: "month" | "timeline"): string[] =>
        createDisplayItems({ listing: LISTING, view }).map(
          (item) => item.label,
        );

      expect(labels("timeline")).toStrictEqual([
        "Layout",
        "Scale",
        "Symbols",
        "Colors",
        "Crowded days",
        "Sky",
      ]);
      expect(labels("month")).not.toContain("Scale");
    });

    it("keeps an icon on every option", () => {
      const items = createDisplayItems({
        listing: LISTING,
        view: "month",
      });

      for (const item of items) {
        expect(item.icon).toBeDefined();
      }
    });

    it("nests Glyphs and Emojis as radios under Symbols, and offers Colors as one", () => {
      const items = createDisplayItems({
        listing: LISTING,
        view: "month",
      });
      const symbols = items.find((item) => item.label === "Symbols");

      expect(symbols?.children?.map((item) => item.value)).toStrictEqual([
        "symbols:glyphs",
        "symbols:emojis",
      ]);
      expect(symbols?.children?.every((item) => item.radio)).toBe(true);

      const values = items.map((item) => item.value);

      expect(values).toContain("colors");
      expect(values).toContain("clusters");
    });

    it("lists the views beneath Layout as radios", () => {
      const calendar = createDisplayItems({
        listing: LISTING,
        view: "month",
      }).find((item) => item.label === "Layout");

      expect(calendar?.children?.every((item) => item.radio)).toBe(true);
      expect(calendar?.children?.map((item) => item.value)).toStrictEqual([
        "calendar:month",
        "calendar:week",
        "calendar:day",
        "calendar:table",
        "calendar:timeline",
      ]);
    });

    it("nests the sky's settings and figures under Sky", () => {
      const sky = createDisplayItems({
        listing: LISTING,
        view: "month",
      }).find((item) => item.label === "Sky");

      expect(sky?.children?.map((item) => item.label)).toStrictEqual([
        "Show the sky",
        "Default sky",
        "Constellations",
        "Ecliptic",
        "Constellation lines",
        "Opacity",
        "Stars",
        "Angles",
        "Background",
      ]);
    });
  });

  describe(describeConstellations, () => {
    it("names all, the zodiac and none, and anything else custom", () => {
      expect(describeConstellations(["all"])).toBe("all");
      expect(describeConstellations(["zodiac"])).toBe("zodiac");
      expect(describeConstellations([])).toBe("none");
      expect(describeConstellations(["leo"])).toBe("custom");
    });
  });

  describe(toDisplayValue, () => {
    it("ticks each choice that is on, with the scale only on the timeline", () => {
      const value = toDisplayValue(CHOICES);

      for (const leaf of [
        "scale:month",
        "symbols:glyphs",
        "clusters",
        "colors",
        "constellations:all",
        "sky:visible",
        "sky:ecliptic",
      ]) {
        expect(value).toContain(leaf);
      }
    });

    it("leaves out what is off", () => {
      const value = toDisplayValue({
        ...CHOICES,
        clusters: false,
        colors: false,
        sky: readNightSkyOverrides({ sky: "off", "sky.ecliptic": false }),
        view: "week",
      });

      expect(value).not.toContain("clusters");
      expect(value).not.toContain("colors");
      expect(value).not.toContain("scale:month");
      expect(value).not.toContain("sky:visible");
      expect(value).not.toContain("sky:ecliptic");
    });
  });

  describe(findToggledLeaf, () => {
    it("finds the one leaf a click added or took away", () => {
      expect(findToggledLeaf(["a"], ["a", "b"])).toBe("b");
      expect(findToggledLeaf(["a", "b"], ["a"])).toBe("b");
      expect(findToggledLeaf(["a"], ["a"])).toBeUndefined();
    });
  });

  describe(applyDisplayLeaf, () => {
    it("sets the calendar view, and ignores one it does not know", () => {
      expect(
        apply("calendar:week").handlers.handleViewChange,
      ).toHaveBeenCalledWith("week");
      expect(
        apply("calendar:narnia").handlers.handleViewChange,
      ).not.toHaveBeenCalled();
    });

    it("sets the scale and the symbols", () => {
      expect(
        apply("scale:year").handlers.handleScaleChange,
      ).toHaveBeenCalledWith("year");
      expect(
        apply("symbols:emojis").handlers.handleSymbolsChange,
      ).toHaveBeenCalledWith("emojis");
      expect(
        apply("symbols:glyphs").handlers.handleSymbolsChange,
      ).toHaveBeenCalledWith("glyphs");
    });

    it("ignores a scale it does not know", () => {
      expect(
        apply("scale:narnia").handlers.handleScaleChange,
      ).not.toHaveBeenCalled();
    });

    it("flips a switch from what it is now", () => {
      expect(
        apply("clusters").handlers.handleClustersChange,
      ).toHaveBeenCalledWith(false);
    });

    it("flips colors from what they are now", () => {
      expect(apply("colors").handlers.handleColorsChange).toHaveBeenCalledWith(
        false,
      );
      expect(
        apply("colors", { ...CHOICES, colors: false }).handlers
          .handleColorsChange,
      ).toHaveBeenCalledWith(true);
    });

    it("writes the sky's visibility, its ecliptic and its figures", () => {
      expect(apply("sky:visible").onSkyChange).toHaveBeenCalledWith({
        sky: "off",
      });
      expect(apply("sky:ecliptic").onSkyChange).toHaveBeenCalledWith({
        "sky.ecliptic": false,
      });
      expect(apply("constellations:zodiac").onSkyChange).toHaveBeenCalledWith({
        "sky.constellations": "zodiac",
      });
      expect(apply("constellations:narnia").onSkyChange).not.toHaveBeenCalled();
    });

    it("does nothing for a branch or a leaf it does not know", () => {
      const { handlers, onSkyChange } = apply("branch:layout");

      expect(onSkyChange).not.toHaveBeenCalled();

      for (const handler of Object.values(handlers)) {
        expect(handler).not.toHaveBeenCalled();
      }
    });
  });
});
