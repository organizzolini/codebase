import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonToolbar } from "./skeleton-toolbar";
import { TOOLBAR_CHIPS } from "./skeleton-toolbar.constants";

describe(SkeletonToolbar, () => {
  it("applies its class name", () => {
    render(
      <SkeletonToolbar
        className="skeleton-toolbar"
        view="table"
      />,
    );

    expect(screen.getByTestId("skeleton-toolbar").className).toContain(
      "skeleton-toolbar",
    );
  });

  it("draws a chip for each control, none of them interactive", () => {
    render(<SkeletonToolbar view="table" />);

    const toolbar = screen.getByTestId("skeleton-toolbar");

    expect(toolbar.children).toHaveLength(TOOLBAR_CHIPS.length);
    expect(toolbar.querySelectorAll("button, a, input")).toHaveLength(0);
  });

  it.each([
    ["table", "md:h-38"],
    ["charts", "md:h-38"],
    ["totals", "md:h-38"],
    ["month", "md:h-29"],
    ["week", "md:h-29"],
    ["timeline", "md:h-29"],
  ] as const)(
    "holds six rows on a phone and the %s view's rows on a tablet",
    (view, height) => {
      render(<SkeletonToolbar view={view} />);

      const { className } = screen.getByTestId("skeleton-toolbar");

      expect(className).toContain("h-56");
      expect(className).toContain(height);
    },
  );
});
