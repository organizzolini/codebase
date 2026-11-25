import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createChartBar,
  createChartSegment,
} from "../../../../../../testing/chart-bars";
import { stubChartSize } from "../../../../../../testing/chart-size";

import { ChartPlot } from "./chart-plot";

import type { ChartBar } from "../../calendar-charts.types";
import type { TooltipContentProps } from "recharts";

// The pointer cannot hover in jsdom, so the chart's tooltip is handed the props a hover would give it.
vi.mock("@codebase/presentation", async () => {
  const sizing = await import("../../../../../../testing/chart-size");

  return sizing.mockChartContainer({
    active: true,
    label: "/0:alpha",
    payload: [{ name: "0", value: 4 }],
  } as unknown as TooltipContentProps);
});

function renderPlot(bars: readonly ChartBar[]): {
  onOpen: ReturnType<typeof vi.fn>;
  onToggle: ReturnType<typeof vi.fn>;
} {
  const onOpen = vi.fn<(parent: string, id: string, color?: string) => void>();
  const onToggle = vi.fn<(id: string, color?: string) => void>();

  render(
    <ChartPlot
      bars={bars}
      metric="EVENTS"
      onOpen={onOpen}
      onToggle={onToggle}
    />,
  );

  return { onOpen, onToggle };
}

describe(ChartPlot, () => {
  beforeEach(() => {
    stubChartSize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draws a column chart with a bar for each piece of each group", () => {
    renderPlot([createChartBar(), createChartBar({ id: "/0:beta" })]);

    expect(document.querySelector(".recharts-surface")).not.toBeNull();
    expect(
      document.querySelectorAll(".recharts-bar-rectangle").length,
    ).toBeGreaterThan(0);
  });

  it("draws every bar when colors are off, compared or not", () => {
    renderPlot([
      createChartBar({
        color: undefined,
        previous: 5,
        previousText: "5",
        segments: [createChartSegment({ color: undefined })],
      }),
    ]);

    expect(document.querySelectorAll(".recharts-bar")).toHaveLength(2);
  });

  it("draws one series for each stack position, not for each piece, so opening many groups stays fast", () => {
    // Fifty bars of two pieces each, every piece with an id of its own: the freeze came from a series per id.
    const bars = Array.from({ length: 50 }, (_, index) =>
      createChartBar({
        id: `/0:group-${String(index)}`,
        segments: [
          createChartSegment({ id: `a-${String(index)}` }),
          createChartSegment({ id: `b-${String(index)}` }),
        ],
      }),
    );

    renderPlot(bars);

    expect(document.querySelectorAll(".recharts-bar")).toHaveLength(2);
  });

  it("draws the previous period beside the bars when compared", () => {
    renderPlot([createChartBar({ previous: 5, previousText: "5" })]);

    expect(document.querySelectorAll(".recharts-bar")).toHaveLength(3);
  });

  it("toggles the group a click on its bar names, and nothing when it names none", () => {
    const { onOpen, onToggle } = renderPlot([
      createChartBar(),
      createChartBar({ id: "/0:beta", target: undefined }),
    ]);

    for (const rectangle of document.querySelectorAll(
      ".recharts-bar-rectangle",
    )) {
      fireEvent.click(rectangle);
    }

    expect(onToggle).toHaveBeenCalledWith("/0:alpha", "red");
    expect(onToggle).not.toHaveBeenCalledWith(undefined, expect.anything());
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("opens the subgroups of the piece a click names, not its bar's group, and toggles the bar for a piece with none", () => {
    const { onOpen, onToggle } = renderPlot([
      createChartBar({
        segments: [
          createChartSegment({ isExpandable: true }),
          createChartSegment({ color: undefined, id: "two", label: "Two" }),
        ],
      }),
    ]);

    for (const rectangle of document.querySelectorAll(
      ".recharts-bar-rectangle",
    )) {
      fireEvent.click(rectangle);
    }

    expect(onOpen).toHaveBeenCalledExactlyOnceWith("/0:alpha", "one", "red");
    expect(onToggle).toHaveBeenCalledExactlyOnceWith("/0:alpha", "red");
  });

  it("toggles the bar's own group when its one piece is the group itself", () => {
    const { onOpen, onToggle } = renderPlot([
      createChartBar({
        segments: [createChartSegment({ id: "/0:alpha", isExpandable: true })],
      }),
    ]);

    for (const rectangle of document.querySelectorAll(
      ".recharts-bar-rectangle",
    )) {
      fireEvent.click(rectangle);
    }

    expect(onOpen).not.toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledExactlyOnceWith("/0:alpha", "red");
  });

  it("toggles the bar's group from the previous period's bar", () => {
    const { onOpen, onToggle } = renderPlot([
      createChartBar({
        previous: 5,
        previousText: "5",
        segments: [createChartSegment({ isExpandable: true })],
      }),
    ]);

    const previous = document.querySelectorAll(".recharts-bar")[1];

    for (const rectangle of previous?.querySelectorAll(
      ".recharts-bar-rectangle",
    ) ?? []) {
      fireEvent.click(rectangle);
    }

    expect(onOpen).not.toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledExactlyOnceWith("/0:alpha", "red");
  });

  it("gives the tooltip the group's bar to describe", () => {
    renderPlot([createChartBar()]);

    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);
    expect(screen.getByText("4 (67%)")).toBeDefined();
  });
});
