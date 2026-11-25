import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SelectStripFlow } from "./select-strip-flow";
import { SELECT_FLOW_CLASS_NAME } from "./select-strip-flow.constants";

import type { SelectStripChip } from "./select-strip-flow.types";

const CHIPS: readonly SelectStripChip[] = [
  { content: <button type="button">One</button>, id: "one" },
  { content: <button type="button">Two</button>, id: "two" },
  { content: <button type="button">Three</button>, id: "three" },
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
});
