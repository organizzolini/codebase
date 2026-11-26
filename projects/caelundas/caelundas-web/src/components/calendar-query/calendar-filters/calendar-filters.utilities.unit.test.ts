import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  isRequiredFilterRule,
  listFoldedFilterNames,
  renderFoldButton,
} from "./calendar-filters.utilities";

import type { FilterRule } from "@codebase/presentation";

const DATE: FilterRule = {
  id: "date",
  operator: "between",
  path: ["date"],
  type: "rule",
  value: undefined,
};
const WEEKDAY: FilterRule = { ...DATE, id: "weekday", path: ["weekday"] };
const FIELDS = [{ id: "weekday", label: "Weekday" }];

describe("calendar-filters utilities", () => {
  describe(isRequiredFilterRule, () => {
    it("is true for the date range alone", () => {
      expect(isRequiredFilterRule(DATE)).toBe(true);
      expect(isRequiredFilterRule(WEEKDAY)).toBe(false);
    });
  });

  describe(listFoldedFilterNames, () => {
    it("names the field of each rule a fold hides, and leaves out the date range", () => {
      expect(
        listFoldedFilterNames(
          [DATE, WEEKDAY, { ...WEEKDAY, path: [] }],
          FIELDS,
        ),
      ).toStrictEqual(["Weekday", ""]);
    });

    it("falls back to the field's id when no field is known", () => {
      expect(
        listFoldedFilterNames([{ ...WEEKDAY, path: ["hour"] }], FIELDS),
      ).toStrictEqual(["hour"]);
    });
  });

  describe(renderFoldButton, () => {
    const fold = {
      isFolded: true,
      onFold: vi.fn<() => void>(),
      onUnfold: vi.fn<() => void>(),
    };

    it("is none while unfolded", () => {
      expect(renderFoldButton(undefined, ["Weekday"], true)).toBeNull();
    });

    it("counts the chips hidden, and unfolds when pressed", () => {
      const button = renderFoldButton(fold, ["Weekday", "Hour"], false);

      render(button);
      fireEvent.click(screen.getByRole("button", { name: /2 Facets/u }));

      expect(fold.onUnfold).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("strip-fold-button").className).not.toContain(
        "rounded-r-none",
      );
    });

    it("squares its right edge when more joins it", () => {
      render(renderFoldButton(fold, ["Weekday"], true));

      expect(screen.getByTestId("strip-fold-button").className).toContain(
        "rounded-r-none",
      );
    });
  });
});
