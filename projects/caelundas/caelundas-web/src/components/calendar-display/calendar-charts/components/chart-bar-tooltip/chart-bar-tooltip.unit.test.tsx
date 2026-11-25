import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChartContainer } from "@codebase/presentation";

import { createChartBar } from "../../../../../../testing/chart-bars";
import { stubChartSize } from "../../../../../../testing/chart-size";

import { ChartBarTooltip } from "./chart-bar-tooltip";

import type { TooltipContentProps } from "recharts";

function renderTooltip(
  label: string,
  payload: readonly { name: string; value: number }[],
  bar = createChartBar(),
): void {
  const tooltip = { active: true, label, payload } as TooltipContentProps;

  render(
    <ChartContainer config={{}}>
      <div>
        <ChartBarTooltip
          bars={[bar]}
          tooltip={tooltip}
        />
      </div>
    </ChartContainer>,
  );
}

describe(ChartBarTooltip, () => {
  beforeEach(() => {
    stubChartSize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("names the hovered group and lists its pieces", () => {
    renderTooltip("/0:alpha", [
      { name: "0", value: 4 },
      { name: "1", value: 2 },
    ]);

    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("One")).toBeDefined();
    expect(screen.getByText("4 (67%)")).toBeDefined();
  });

  it("lists the previous period", () => {
    renderTooltip(
      "/0:alpha",
      [{ name: "previous", value: 5 }],
      createChartBar({ previous: 5, previousText: "5" }),
    );

    expect(screen.getByText("Previous period")).toBeDefined();
  });

  it("draws nothing for a bar it does not know", () => {
    renderTooltip("/0:other", [{ name: "0", value: 4 }]);

    expect(screen.queryByText("Alpha")).toBeNull();
  });
});
