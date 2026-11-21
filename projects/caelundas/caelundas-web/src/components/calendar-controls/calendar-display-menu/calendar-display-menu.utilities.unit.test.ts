import { describe, expect, it, vi } from "vitest";

import { readNightSkyOverrides } from "../../../hooks/use-night-sky/use-night-sky.utilities";
import { createEventGroupFields } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import {
  applyDisplayLeaf,
  createDisplayItems,
  describeConstellations,
  findToggledLeaf,
  toDisplayValue,
} from "./calendar-display-menu.utilities";

import type { UseCalendarDisplayResult } from "../../../hooks/use-calendar-display/use-calendar-display.types";
import type { DisplayChoices } from "./calendar-display-menu.types";

const FIELDS = createEventGroupFields([
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
    ],
  },
]);
const LISTING = [
  { name: "Aries", zodiac: true },
  { name: "Orion", zodiac: false },
];
const CHOICES: DisplayChoices = {
  clusters: true,
  colorBy: undefined,
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

  applyDisplayLeaf(leaf, { choices, fields: FIELDS, handlers, onSkyChange });

  return { handlers, onSkyChange };
}

/**
 * The handlers a leaf may call, each a spy.
 */
function createHandlers(): UseCalendarDisplayResult["handlers"] {
  return {
    handleClustersChange: vi.fn<(enabled: boolean) => void>(),
    handleColorByChange: vi.fn<() => void>(),
    handleColorsChange: vi.fn<(enabled: boolean) => void>(),
    handleScaleChange: vi.fn<() => void>(),
    handleSymbolsChange: vi.fn<() => void>(),
    handleViewChange: vi.fn<() => void>(),
  };
}

describe("calendar-display-menu utilities", () => {
  describe(createDisplayItems, () => {
    it("offers Calendar, Symbols, Crowded days, Color and Sky, with a Scale only on the timeline", () => {
      const labels = (view: "month" | "timeline"): string[] =>
        createDisplayItems(FIELDS, { listing: LISTING, view }).map(
          (item) => item.label,
        );

      expect(labels("timeline")).toStrictEqual([
        "Calendar",
        "Scale",
        "Symbols",
        "Crowded days",
        "Color",
        "Sky",
      ]);
      expect(labels("month")).not.toContain("Scale");
    });

    it("keeps an icon on the Calendar, Color and Sky options", () => {
      const items = createDisplayItems(FIELDS, {
        listing: LISTING,
        view: "month",
      });

      for (const label of ["Calendar", "Color", "Sky"]) {
        expect(items.find((item) => item.label === label)?.icon).toBeDefined();
      }
    });

    it("lists none, the event kind and each field to color by directly under Color", () => {
      const color = createDisplayItems(FIELDS, {
        listing: LISTING,
        view: "month",
      }).find((item) => item.label === "Color");

      expect(
        color?.children?.map((item) => item.value).slice(0, 2),
      ).toStrictEqual(["colorBy:none", "colorBy:default"]);
      expect(color?.children?.map((item) => item.value)).toContain(
        "colorBy:tag:type",
      );
    });

    it("nests the sky's settings and figures under Sky", () => {
      const sky = createDisplayItems(FIELDS, {
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
        "colorBy:default",
        "constellations:all",
        "sky:visible",
        "sky:ecliptic",
      ]) {
        expect(value).toContain(leaf);
      }
    });

    it("leaves out what is off, and names the field colored by", () => {
      const value = toDisplayValue({
        ...CHOICES,
        clusters: false,
        colorBy: { field: "tag:type" },
        colors: false,
        sky: readNightSkyOverrides({ sky: "off", "sky.ecliptic": false }),
        view: "week",
      });

      expect(value).not.toContain("clusters");
      expect(value).toContain("colorBy:none");
      expect(value).not.toContain("colorBy:tag:type");
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

    it("turns colors off for none, and on again for any other choice", () => {
      expect(
        apply("colorBy:none").handlers.handleColorsChange,
      ).toHaveBeenCalledWith(false);
      expect(
        apply("colorBy:default", { ...CHOICES, colors: false }).handlers
          .handleColorsChange,
      ).toHaveBeenCalledWith(true);
    });

    it("colors by a field's first level, or by the event kind", () => {
      expect(
        apply("colorBy:tag:type").handlers.handleColorByChange,
      ).toHaveBeenCalledWith({
        depth: 1,
        field: "tag:type",
      });
      expect(
        apply("colorBy:default").handlers.handleColorByChange,
      ).toHaveBeenCalledWith(undefined);
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
      const { handlers, onSkyChange } = apply("branch:calendar");

      expect(onSkyChange).not.toHaveBeenCalled();

      for (const handler of Object.values(handlers)) {
        expect(handler).not.toHaveBeenCalled();
      }
    });
  });
});
