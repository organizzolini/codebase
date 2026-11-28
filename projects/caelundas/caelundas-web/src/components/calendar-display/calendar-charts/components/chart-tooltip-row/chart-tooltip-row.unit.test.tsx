import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createChartSegment } from "../../../../../../testing/chart-bars";

import { ChartTooltipRow } from "./chart-tooltip-row";

describe(ChartTooltipRow, () => {
  it("lists a piece with its value and share", () => {
    render(
      <ChartTooltipRow
        previousText=""
        segment={createChartSegment()}
      />,
    );

    expect(screen.getByText("One")).toBeDefined();
    expect(screen.getByText("4 (67%)")).toBeDefined();
  });

  it("lists a value alone when it has no share, in the default color", () => {
    render(
      <ChartTooltipRow
        previousText=""
        segment={createChartSegment({ color: undefined, share: "" })}
      />,
    );

    expect(screen.getByText("4")).toBeDefined();
  });

  it("draws the swatch black with a white border when colors are off", () => {
    const { container } = render(
      <ChartTooltipRow
        previousText=""
        segment={createChartSegment({ color: undefined })}
        plain
      />,
    );
    const swatch = container.querySelector("span");

    expect(swatch?.style.backgroundColor).toBe("rgb(0, 0, 0)");
    expect(swatch?.style.border).toContain("rgb(255, 255, 255)");
  });

  it("lists the previous period when there is no piece", () => {
    render(
      <ChartTooltipRow
        previousText="5"
        segment={undefined}
      />,
    );

    expect(screen.getByText("Previous period")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
  });
});
