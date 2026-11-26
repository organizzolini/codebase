import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SelectStripFlow } from "./select-strip-flow";
import { SELECT_FLOW_CLASS_NAME } from "./select-strip-flow.constants";

import type { StripFold } from "../../../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";
import type { SelectStripChip } from "./select-strip-flow.types";

const CHIPS: readonly SelectStripChip[] = [
  { content: <button type="button">One</button>, id: "one", name: "One" },
  { content: <button type="button">Two</button>, id: "two", name: "Two" },
  { content: <button type="button">Three</button>, id: "three", name: "Three" },
];

function renderFlow(chips: readonly SelectStripChip[]): void {
  render(
    <SelectStripFlow
      chips={chips}
      label="Select"
      trigger={<button type="button">Base</button>}
    />,
  );
}

describe(SelectStripFlow, () => {
  it("keeps the base button and the first chip in one item", () => {
    renderFlow(CHIPS);

    const base = screen.getByRole("group", { name: "Select" });

    expect(base.textContent).toBe("BaseOne");
    expect(Object.hasOwn(base.dataset, "stripItem")).toBe(true);
    expect(Object.hasOwn(base.dataset, "stripChip")).toBe(false);
  });

  it("gives each later chip an item of its own", () => {
    renderFlow(CHIPS);

    const items = document.querySelectorAll<HTMLElement>("[data-strip-chip]");

    expect([...items].map((item) => item.textContent)).toStrictEqual([
      "Two",
      "Three",
    ]);
    expect(
      [...items].every((item) => Object.hasOwn(item.dataset, "stripItem")),
    ).toBe(true);
  });

  it("squares every joint, including those either side of a line break", () => {
    expect(SELECT_FLOW_CLASS_NAME).toContain(
      "[&_[data-strip-chip]>[data-slot]:first-child]:rounded-l-none!",
    );
    expect(SELECT_FLOW_CLASS_NAME).toContain(
      "[&_[data-strip-item]:not(:last-child)>[data-slot]:not(:has(~[data-slot]))]:rounded-r-none!",
    );
    expect(SELECT_FLOW_CLASS_NAME).not.toContain("[data-slot]:last-child");
    expect(SELECT_FLOW_CLASS_NAME).not.toContain("rounded-r-lg");
    expect(SELECT_FLOW_CLASS_NAME).not.toContain("rounded-l-lg");
  });

  it("keeps the left border on a chip that opens a line", () => {
    expect(SELECT_FLOW_CLASS_NAME).toContain(
      "[&_[data-strip-chip]:not([data-line-start])>[data-slot]:first-child]:border-l-0",
    );
    expect(SELECT_FLOW_CLASS_NAME).toContain(
      "[&_[data-strip-chip][data-line-start]]:ml-0",
    );
  });

  it("renders the base button alone without chips", () => {
    renderFlow([]);

    expect(screen.getByRole("group", { name: "Select" }).textContent).toBe(
      "Base",
    );
    expect(document.querySelector("[data-strip-chip]")).toBeNull();
  });

  describe("folded", () => {
    function renderFolded(isFolded: boolean, chips = CHIPS): StripFold {
      const fold: StripFold = {
        isFolded,
        onFold: vi.fn<() => void>(),
        onUnfold: vi.fn<() => void>(),
      };

      render(
        <SelectStripFlow
          chips={chips}
          fold={fold}
          label="Select"
          trigger={<button type="button">Base</button>}
        />,
      );

      return fold;
    }

    it("shows the base button and a count of the chips, and no chip", () => {
      renderFolded(true);

      const base = screen.getByRole("group", { name: "Select" });

      expect(base.querySelectorAll("button")).toHaveLength(2);
      expect(base.textContent).toBe("Base3 Facets");
      expect(screen.getByTestId("strip-fold-button").title).toBe(
        "One, Two, Three",
      );
      expect(document.querySelector("[data-strip-chip]")).toBeNull();
    });

    it("unfolds when the count is pressed", () => {
      const fold = renderFolded(true);

      fireEvent.click(screen.getByTestId("strip-fold-button"));

      expect(fold.onUnfold).toHaveBeenCalledTimes(1);
    });

    it("shows every chip while unfolded", () => {
      renderFolded(false);

      expect(screen.queryByTestId("strip-fold-button")).toBeNull();
      expect(document.querySelectorAll("[data-strip-chip]")).toHaveLength(2);
    });

    it("stays plain with no chip to fold", () => {
      renderFolded(true, []);

      expect(screen.queryByTestId("strip-fold-button")).toBeNull();
    });
  });
});
