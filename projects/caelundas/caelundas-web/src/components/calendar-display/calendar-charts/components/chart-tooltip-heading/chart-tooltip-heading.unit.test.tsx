import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createChartBar } from "../../../../../../testing/chart-bars";

import { ChartTooltipHeading } from "./chart-tooltip-heading";

describe(ChartTooltipHeading, () => {
  it("names the group alone when it is not compared", () => {
    render(
      <ChartTooltipHeading
        bar={createChartBar()}
        hidden={0}
      />,
    );

    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.queryByTestId("chart-tooltip-change")).toBeNull();
    expect(screen.queryByText(/not listed/)).toBeNull();
  });

  it("gives the change with its percent, and how many pieces are left out", () => {
    render(
      <ChartTooltipHeading
        bar={createChartBar({
          change: {
            direction: "up",
            percent: 50,
            percentText: "+50%",
            text: "+2 events",
          },
        })}
        hidden={3}
      />,
    );

    expect(screen.getByTestId("chart-tooltip-change").textContent).toBe(
      "+2 events (+50%)",
    );
    expect(screen.getByText("3 more not listed")).toBeDefined();
  });

  it("gives the change alone when it has no percent", () => {
    render(
      <ChartTooltipHeading
        bar={createChartBar({
          change: {
            direction: "flat",
            percent: null,
            percentText: "",
            text: "No change",
          },
        })}
        hidden={0}
      />,
    );

    expect(screen.getByTestId("chart-tooltip-change").textContent).toBe(
      "No change",
    );
  });
});
