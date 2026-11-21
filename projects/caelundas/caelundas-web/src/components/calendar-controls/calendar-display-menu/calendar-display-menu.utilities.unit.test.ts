import { describe, expect, it, vi } from "vitest";

import { createEventGroupFields } from "../../calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities";

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
const CHOICES: DisplayChoices = {
  clusters: true,
  colorBy: undefined,
  colors: true,
  constellations: ["all"],
  ecliptic: true,
  scale: "month",
  skyOff: false,
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
  handlers: ReturnType<typeof createHandlers>;
  onSkyChange: ReturnType<typeof vi.fn>;
} {
  const handlers = createHandlers();
  const onSkyChange = vi.fn<() => void>();

  applyDisplayLeaf(leaf, {
    choices,
    fields: FIELDS,
    handlers: handlers as unknown as UseCalendarDisplayResult["handlers"],
    onSkyChange,
  });

  return { handlers, onSkyChange };
}

/**
 * The handlers a leaf may call, each a spy.
 */
function createHandlers(): {
  [Name in keyof UseCalendarDisplayResult["handlers"]]: ReturnType<
    typeof vi.fn
  >;
} {
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
        createDisplayItems(FIELDS, view).map((item) => item.label);

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
      const items = createDisplayItems(FIELDS, "month");

      for (const label of ["Calendar", "Color", "Sky"]) {
        expect(items.find((item) => item.label === label)?.icon).toBeDefined();
      }
    });

    it("lists each field to color by, after the event kind", () => {
      const color = createDisplayItems(FIELDS, "month").find(
        (item) => item.label === "Color",
      );
      const colorBy = color?.children?.find(
        (item) => item.label === "Color by",
      );

      expect(colorBy?.children?.[0]?.value).toBe("colorBy:default");
      expect(colorBy?.children?.map((item) => item.value)).toContain(
        "colorBy:tag:type",
      );
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
      expect(toDisplayValue(CHOICES)).toStrictEqual([
        "calendar:timeline",
        "scale:month",
        "symbols:glyphs",
        "clusters",
        "colors",
        "colorBy:default",
        "sky:visible",
        "sky:ecliptic",
        "constellations:all",
      ]);
    });

    it("leaves out what is off, and names the field colored by", () => {
      expect(
        toDisplayValue({
          ...CHOICES,
          clusters: false,
          colorBy: { field: "tag:type" },
          colors: false,
          ecliptic: false,
          skyOff: true,
          view: "week",
        }),
      ).toStrictEqual([
        "calendar:week",
        "symbols:glyphs",
        "colorBy:tag:type",
        "constellations:all",
      ]);
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
    it("sets the calendar view, the scale and the symbols", () => {
      expect(
        apply("calendar:week").handlers.handleViewChange,
      ).toHaveBeenCalledWith("week");
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

    it("ignores a view or scale it does not know", () => {
      expect(
        apply("calendar:narnia").handlers.handleViewChange,
      ).not.toHaveBeenCalled();
      expect(
        apply("scale:narnia").handlers.handleScaleChange,
      ).not.toHaveBeenCalled();
    });

    it("flips a switch from what it is now", () => {
      expect(
        apply("clusters").handlers.handleClustersChange,
      ).toHaveBeenCalledWith(false);
      expect(
        apply("colors", { ...CHOICES, colors: false }).handlers
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
