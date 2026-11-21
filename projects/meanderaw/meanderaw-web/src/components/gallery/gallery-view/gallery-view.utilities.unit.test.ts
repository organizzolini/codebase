import { describe, expect, it } from "vitest";

import { DEFAULT_FILTER_LINK } from "../gallery-filters/components/filter-query/filter-query.constants";

import { VIEW_PRESETS } from "./gallery-view.constants";
import { describeView, isPresetActive } from "./gallery-view.utilities";

import type { ViewState } from "./gallery-view.types";

const STATE: ViewState = {
  direction: "asc",
  group: [],
  link: DEFAULT_FILTER_LINK,
  sort: undefined,
  view: "list",
};

describe("gallery view utilities", () => {
  describe(describeView, () => {
    it("names the saved view in force, the default one aside, else the layout", () => {
      expect(describeView(VIEW_PRESETS, STATE)).toBe("List");
      expect(
        describeView(VIEW_PRESETS, { ...STATE, group: ["rows", "columns"] }),
      ).toBe("By rows then columns");
      expect(
        describeView(VIEW_PRESETS, {
          ...STATE,
          group: ["isChain"],
          view: "grid",
        }),
      ).toBe("Grid");
    });
  });

  describe(isPresetActive, () => {
    it("holds when every part the view fixes is as the state has it", () => {
      const [grid] = VIEW_PRESETS;

      expect(grid && isPresetActive(grid, { ...STATE, view: "grid" })).toBe(
        true,
      );
      expect(grid && isPresetActive(grid, STATE)).toBe(false);
    });
  });
});
