import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createChartBar } from "../../../../../../testing/chart-bars";

import { ChartBarRow } from "./chart-bar-row";

import type { ChartBar } from "../../calendar-charts.types";

function renderRow(bar: Partial<ChartBar> = {}): ReturnType<typeof vi.fn> {
  const onToggle = vi.fn<(id: string, color?: string) => void>();

  render(
    <ul>
      <ChartBarRow
        bar={createChartBar(bar)}
        onToggle={onToggle}
      />
    </ul>,
  );

  return onToggle;
}

describe(ChartBarRow, () => {
  it("opens a group that can open, by its id", () => {
    const onToggle = renderRow();
    const button = screen.getByRole("button", { name: "Alpha: 6" });

    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith("/0:alpha", "red");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("title")).toBe("Open Alpha");
  });

  it("closes the group above a subgroup", () => {
    const onToggle = renderRow({ isExpandable: false, target: "/0:parent" });
    const button = screen.getByRole("button", { name: "Alpha: 6" });

    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith("/0:parent", "red");
    expect(button.getAttribute("aria-expanded")).toBeNull();
    expect(button.getAttribute("title")).toBe("Close the group");
  });

  it("does nothing when no group can be opened or closed", () => {
    const onToggle = renderRow({ isExpandable: false, target: undefined });
    const button = screen.getByRole("button", { name: "Alpha: 6" });

    fireEvent.click(button);

    expect(onToggle).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.getAttribute("title")).toBe("Alpha");
  });
});
