import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonTable } from "./skeleton-table";
import { TABLE_HEADS, TABLE_ROWS } from "./skeleton-table.constants";

describe(SkeletonTable, () => {
  it("applies its class name", () => {
    render(<SkeletonTable className="skeleton-table" />);

    expect(screen.getByTestId("skeleton-table").className).toContain(
      "skeleton-table",
    );
  });

  it("draws a pill for each column head", () => {
    render(<SkeletonTable />);

    expect(screen.getByTestId("skeleton-table-heads").children).toHaveLength(
      TABLE_HEADS.length,
    );
  });

  it("draws group rows with a pill for each count and event rows with a pill for each time", () => {
    render(<SkeletonTable />);

    const groups = screen.getAllByTestId("skeleton-table-group");
    const events = screen.getAllByTestId("skeleton-table-event");

    expect(groups.length + events.length).toBe(TABLE_ROWS.length);
    expect(groups[0]?.children).toHaveLength(4);
    expect(events[0]?.children).toHaveLength(4);
  });

  it("indents each group by its depth", () => {
    render(<SkeletonTable />);

    const pills = screen
      .getAllByTestId("skeleton-table-group")
      .slice(0, 2)
      .map((group) => group.querySelector<HTMLElement>("[data-slot=skeleton]"));

    expect(pills[0]?.style.marginLeft).toBe("0rem");
    expect(pills[1]?.style.marginLeft).toBe("1.25rem");
  });

  it("has no interactive element and fills nothing behind its rows", () => {
    render(<SkeletonTable />);

    const table = screen.getByTestId("skeleton-table");

    expect(table.querySelectorAll("button, a, input")).toHaveLength(0);
    expect(table.className).not.toMatch(/\bbg-|blur/);
  });
});
