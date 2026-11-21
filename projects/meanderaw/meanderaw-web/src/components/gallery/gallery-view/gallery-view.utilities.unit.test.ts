import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { DEFAULT_VIEW_STATE, VIEW_PRESETS } from "./gallery-view.constants";
import {
  createViewNodes,
  createViewPresets,
  describeView,
  isPresetActive,
} from "./gallery-view.utilities";

import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";

/** A catalog entry for a key, as the API lists one. */
function entry(key: string): GalleryCharacteristic {
  return {
    category: "path",
    description: "d",
    isPattern: false,
    key,
    meanderCount: 0,
    name: key,
    valueCounts: [],
    valueType: "number",
  };
}

describe("gallery view utilities", () => {
  describe(createViewPresets, () => {
    it("leaves out the presets whose characteristics the catalog lacks", () => {
      expect(
        createViewPresets(FIXTURE_CHARACTERISTICS).map(({ id }) => id),
      ).toStrictEqual(["default", "by-rows-columns"]);
      expect(createViewPresets([])).toHaveLength(2);
      expect(
        createViewPresets(
          ["cornerCount", "bettiNumber0Count"].map((key) => entry(key)),
        ),
      ).toHaveLength(VIEW_PRESETS.length);
    });
  });

  describe(createViewNodes, () => {
    it("holds the presets under one parent, each with its description", () => {
      const [presets] = createViewNodes(VIEW_PRESETS);

      expect(presets?.label).toBe("Presets");
      expect(presets?.children?.map(({ value }) => value)).toStrictEqual(
        VIEW_PRESETS.map(({ id }) => id),
      );
      expect(presets?.children?.[0]?.description).toContain("A grid");
    });
  });

  describe(describeView, () => {
    it("names the preset in force, else Custom", () => {
      expect(describeView(VIEW_PRESETS, DEFAULT_VIEW_STATE)).toBe("Default");
      expect(
        describeView(VIEW_PRESETS, {
          ...DEFAULT_VIEW_STATE,
          group: ["rows", "columns"],
        }),
      ).toBe("By rows then columns");
      expect(
        describeView(VIEW_PRESETS, { ...DEFAULT_VIEW_STATE, view: "list" }),
      ).toBe("Custom");
    });
  });

  describe(isPresetActive, () => {
    it("holds when every part is as the preset has it", () => {
      const [fallback] = VIEW_PRESETS;

      expect(fallback && isPresetActive(fallback, DEFAULT_VIEW_STATE)).toBe(
        true,
      );
      expect(
        fallback &&
          isPresetActive(fallback, {
            ...DEFAULT_VIEW_STATE,
            direction: "desc",
          }),
      ).toBe(false);
    });
  });
});
