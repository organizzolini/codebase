import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonColumns } from "./skeleton-columns";

describe(SkeletonColumns, () => {
  it("applies its class name", () => {
    render(
      <SkeletonColumns
        className="skeleton-columns"
        count={1}
      />,
    );

    expect(screen.getByTestId("skeleton-columns").className).toContain(
      "skeleton-columns",
    );
  });

  it.each([1, 7])("draws %i columns beside the hour gutter", (count) => {
    const { container } = render(<SkeletonColumns count={count} />);

    expect(screen.getAllByTestId("skeleton-column")).toHaveLength(count);
    expect(
      container.querySelectorAll(`[style*='repeat(${String(count)},']`),
    ).toHaveLength(3);
  });

  it("places events down each column, varying from day to day", () => {
    render(<SkeletonColumns count={7} />);

    const columns = screen.getAllByTestId("skeleton-column");
    const events = (index: number): number =>
      columns[index]?.querySelectorAll("[data-slot=skeleton]").length ?? 0;

    expect(events(0)).toBe(2);
    expect(events(1)).toBe(3);
    expect(events(3)).toBe(1);
    expect(events(4)).toBe(2);
  });

  it("has no interactive element", () => {
    render(<SkeletonColumns count={7} />);

    expect(
      screen
        .getByTestId("skeleton-columns")
        .querySelectorAll("button, a, input"),
    ).toHaveLength(0);
  });
});
