import { describe, expect, it, vi } from "vitest";

import { readNightSkyOverrides } from "../../../hooks/use-night-sky/use-night-sky.utilities";

import {
  applyDisplayLeaf,
  createDisplayItems,
  describeConstellations,
  findToggledLeaf,
  isDisplayChoice,
  toDisplayValue,
} from "./calendar-display-menu.utilities";

import type { UseCalendarDisplayResult } from "../../../hooks/use-calendar-display/use-calendar-display.types";
import type { DisplayChoices } from "./calendar-display-menu.types";
import type { CascaderNode } from "@codebase/presentation";

const LISTING = [
  { name: "Aries", zodiac: true },
  { name: "Orion", zodiac: false },
];
const CHOICES: DisplayChoices = {
  clusters: true,
  colors: true,
  compare: false,
  listing: LISTING,
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
    handleCompareChange: vi.fn<(enabled: boolean) => void>(),
    handleScaleChange: vi.fn<() => void>(),
    handleSymbolsChange: vi.fn<() => void>(),
    handleViewChange: vi.fn<() => void>(),
  };
}

/**
 * The values of every row beneath these that lacks a description, apart from the many figure, step, and swatch values.
 */
function listMissingDescriptions(nodes: readonly CascaderNode[]): string[] {
  const missing: string[] = [];

  for (const node of nodes) {
    const isValue =
      node.value.startsWith("setting:") ||
      node.value.startsWith("constellation:");

    if (!isValue && (node.description ?? "").trim() === "") {
      missing.push(node.value);
    }

    missing.push(...listMissingDescriptions(node.children ?? []));
  }

  return missing;
}

describe("calendar-display-menu utilities", () => {
  describe(createDisplayItems, () => {
    it("describes every row", () => {
      expect(
        listMissingDescriptions(createDisplayItems({ listing: LISTING })),
      ).toStrictEqual([]);
    });

    it("offers Symbols, Colors, Crowded days and Skyfield, with no Layout", () => {
      expect(
        createDisplayItems({ listing: LISTING }).map((item) => item.label),
      ).toStrictEqual(["Symbols", "Colors", "Crowded days", "Skyfield"]);
    });

    it("offers Compare to previous period only for the metric layouts", () => {
      const labels = (view: "charts" | "table" | "totals"): string[] =>
        createDisplayItems({ listing: LISTING, view }).map(
          (item) => item.label,
        );

      expect(labels("charts")).toContain("Compare to previous period");
      expect(labels("totals")).toContain("Compare to previous period");
      expect(labels("table")).not.toContain("Compare to previous period");
      expect(
        createDisplayItems({ listing: LISTING }).map((item) => item.label),
      ).not.toContain("Compare to previous period");
    });

    it("keeps an icon on every option", () => {
      const items = createDisplayItems({ listing: LISTING });

      for (const item of items) {
        expect(item.icon).toBeDefined();
      }
    });

    it("nests Glyphs and Emojis as radios under Symbols, and offers Colors as one", () => {
      const items = createDisplayItems({ listing: LISTING });
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

    it("nests the sky's settings and figures under Skyfield", () => {
      const sky = createDisplayItems({ listing: LISTING }).find(
        (item) => item.label === "Skyfield",
      );

      expect(sky?.children?.map((item) => item.label)).toStrictEqual([
        "Show the skyfield",
        "Default skyfield",
        "Opacity",
        "Constellations",
        "Ecliptic",
        "Constellation lines",
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
    it("ticks each choice that is on", () => {
      const value = toDisplayValue(CHOICES);

      for (const leaf of [
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

    it("ticks the comparison only on the metric layouts", () => {
      expect(
        toDisplayValue({ ...CHOICES, compare: true, view: "charts" }),
      ).toContain("compare");
      expect(
        toDisplayValue({ ...CHOICES, compare: true, view: "table" }),
      ).not.toContain("compare");
      expect(
        toDisplayValue({ ...CHOICES, compare: false, view: "totals" }),
      ).not.toContain("compare");
    });

    it("leaves out what is off", () => {
      const value = toDisplayValue({
        ...CHOICES,
        clusters: false,
        colors: false,
        sky: readNightSkyOverrides({
          skyfield: "off",
          "skyfield.ecliptic": false,
        }),
        view: "week",
      });

      expect(value).not.toContain("clusters");
      expect(value).not.toContain("colors");
      expect(value).not.toContain("sky:visible");
      expect(value).not.toContain("sky:ecliptic");
    });
  });

  describe(isDisplayChoice, () => {
    it("lets every row be picked but the grouping branches", () => {
      expect(isDisplayChoice({ label: "Skyfield", value: "branch:sky" })).toBe(
        false,
      );
      expect(isDisplayChoice({ label: "Colors", value: "colors" })).toBe(true);
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
    it("sets the symbols", () => {
      expect(
        apply("symbols:emojis").handlers.handleSymbolsChange,
      ).toHaveBeenCalledWith("emojis");
      expect(
        apply("symbols:glyphs").handlers.handleSymbolsChange,
      ).toHaveBeenCalledWith("glyphs");
    });

    it("leaves the layout to its own menu", () => {
      expect(
        apply("calendar:week").handlers.handleViewChange,
      ).not.toHaveBeenCalled();
      expect(
        apply("scale:year").handlers.handleScaleChange,
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

    it("flips the comparison from what it is now", () => {
      expect(
        apply("compare").handlers.handleCompareChange,
      ).toHaveBeenCalledWith(true);
      expect(
        apply("compare", { ...CHOICES, compare: true }).handlers
          .handleCompareChange,
      ).toHaveBeenCalledWith(false);
    });

    it("writes the sky's visibility, its ecliptic and its figures", () => {
      expect(apply("sky:visible").onSkyChange).toHaveBeenCalledWith({
        skyfield: "off",
      });
      expect(apply("sky:ecliptic").onSkyChange).toHaveBeenCalledWith({
        "skyfield.ecliptic": false,
      });
      expect(apply("constellations:zodiac").onSkyChange).toHaveBeenCalledWith({
        "skyfield.constellations": "zodiac",
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
