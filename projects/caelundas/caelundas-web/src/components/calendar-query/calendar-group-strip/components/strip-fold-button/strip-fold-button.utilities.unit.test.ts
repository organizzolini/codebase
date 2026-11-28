import { describe, expect, it, vi } from "vitest";

import {
  createStripFolds,
  formatFoldCount,
  parseFoldedStrips,
  toFoldedStrip,
  toFoldSearch,
} from "./strip-fold-button.utilities";

import type { StripFold } from "./strip-fold-button.types";

describe("strip fold", () => {
  describe(parseFoldedStrips, () => {
    it("reads a comma-separated list in the strips' order", () => {
      expect(parseFoldedStrips("sort,select")).toStrictEqual([
        "select",
        "sort",
      ]);
    });

    it("ignores unknown names, repeats and anything that is not text", () => {
      expect(parseFoldedStrips("group,nope,group")).toStrictEqual(["group"]);
      expect(parseFoldedStrips(["group"])).toStrictEqual([]);
      expect(parseFoldedStrips(undefined)).toStrictEqual([]);
    });
  });

  describe(toFoldSearch, () => {
    it("joins the strips, and drops the parameter when none are folded", () => {
      expect(toFoldSearch(["select", "group"])).toBe("select,group");
      expect(toFoldSearch([])).toBeUndefined();
    });
  });

  describe(formatFoldCount, () => {
    it("is singular for one facet", () => {
      expect(formatFoldCount(1)).toBe("1 Facet");
      expect(formatFoldCount(0)).toBe("0 Facets");
      expect(formatFoldCount(4)).toBe("4 Facets");
    });
  });

  describe(toFoldedStrip, () => {
    const fold: StripFold = {
      isFolded: true,
      onFold: vi.fn<() => void>(),
      onUnfold: vi.fn<() => void>(),
    };

    it("keeps a folded strip that has a facet to fold", () => {
      expect(toFoldedStrip(fold, 2)).toBe(fold);
    });

    it("leaves a strip with no facets, an unfolded one, or none, plain", () => {
      expect(toFoldedStrip(fold, 0)).toBeUndefined();
      expect(toFoldedStrip({ ...fold, isFolded: false }, 2)).toBeUndefined();
      expect(toFoldedStrip(undefined, 2)).toBeUndefined();
    });
  });

  describe(createStripFolds, () => {
    it("gives no strip a fold when a change cannot be written", () => {
      expect(
        Object.values(createStripFolds(["select"], undefined)),
      ).toStrictEqual([undefined, undefined, undefined, undefined]);
    });

    it("writes the strips folded after one is folded or unfolded", () => {
      const onChange = vi.fn<(fold: string | undefined) => void>();
      const folds = createStripFolds(["select"], onChange);

      folds.group?.onFold();
      folds.select?.onUnfold();

      expect(folds.select?.isFolded).toBe(true);
      expect(folds.sort?.isFolded).toBe(false);
      expect(onChange).toHaveBeenNthCalledWith(1, "select,group");
      expect(onChange).toHaveBeenNthCalledWith(2, undefined);
    });
  });
});
