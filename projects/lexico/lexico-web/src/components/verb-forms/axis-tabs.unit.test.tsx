import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AxisTabs } from "./axis-tabs";

describe(AxisTabs, () => {
  it("applies its class name", () => {
    render(
      <AxisTabs
        className="axis-tabs"
        onChange={vi.fn<(value: string) => void>()}
        options={["indicative"]}
        value="indicative"
      />,
    );

    expect(screen.getByTestId("axis-tabs").className).toBe("axis-tabs");
  });

  it("draws nothing for an axis with no values", () => {
    render(
      <AxisTabs
        onChange={vi.fn<(value: string) => void>()}
        options={[]}
        value={undefined}
      />,
    );

    expect(screen.queryByTestId("axis-tabs")).toBeNull();
  });

  it("names each tab in full for readers", () => {
    render(
      <AxisTabs
        onChange={vi.fn<(value: string) => void>()}
        options={["indicative", "subjunctive"]}
        value="indicative"
      />,
    );

    expect(screen.getByRole("tab", { name: "subjunctive" })).toBeDefined();
  });
});
