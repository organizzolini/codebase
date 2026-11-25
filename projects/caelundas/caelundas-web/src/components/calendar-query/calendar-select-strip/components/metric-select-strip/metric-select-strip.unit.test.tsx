import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { MetricSelectStrip } from "./metric-select-strip";

import type { EventMetric } from "../../../../../graphql/generated/operations";

function renderStrip(metrics: readonly EventMetric[]): {
  onMetricsChange: ReturnType<
    typeof vi.fn<(metrics: readonly EventMetric[] | undefined) => void>
  >;
} {
  const onMetricsChange =
    vi.fn<(metrics: readonly EventMetric[] | undefined) => void>();

  render(
    <MetricSelectStrip
      metrics={metrics}
      onMetricsChange={onMetricsChange}
    />,
  );

  return { onMetricsChange };
}

describe(MetricSelectStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <MetricSelectStrip
        className="metric-select-strip"
        metrics={["EVENTS"]}
      />,
    );

    expect(screen.getByTestId("metric-select-strip").className).toBe(
      "metric-select-strip",
    );
  });

  it("offers no dates to the Charts", () => {
    render(
      <MetricSelectStrip
        metrics={["EVENTS"]}
        view="charts"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    expect(screen.queryByText("Times")).toBeNull();
    expect(screen.queryByText("First start")).toBeNull();
  });

  it("leads the Select button with the cursor icon", () => {
    renderStrip(["EVENTS"]);

    expect(
      screen
        .getByRole("button", { name: "Select" })
        .querySelector("svg")
        ?.classList.contains("lucide-mouse-pointer-2"),
    ).toBe(true);
  });

  it("shows a chip for each metric, in order", () => {
    renderStrip(["SPANS", "EVENTS"]);

    const names = screen
      .getAllByRole("button")
      .map((button) => button.textContent)
      .filter((name) => name === "Spans" || name === "Events");

    expect(names).toStrictEqual(["Spans", "Events"]);
  });

  it("lists the metrics under their branches, with their notes", async () => {
    renderStrip(["EVENTS"]);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    await expect(screen.findByText("Counts")).resolves.toBeDefined();
    expect(screen.getByText("Durations")).toBeDefined();
    expect(
      screen.getByText("How many distinct events there are."),
    ).toBeDefined();
  });

  it("adds a metric picked from the list after the others", async () => {
    const { onMetricsChange } = renderStrip(["EVENTS"]);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(await screen.findByText("Unique names"));

    expect(onMetricsChange).toHaveBeenCalledWith(["EVENTS", "UNIQUE_NAMES"]);
  });

  it("removes a metric from its ellipsis menu", async () => {
    const { onMetricsChange } = renderStrip(["EVENTS", "SPANS"]);

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onMetricsChange).toHaveBeenCalledWith(["SPANS"]);
  });

  it("cannot remove the last metric", async () => {
    renderStrip(["EVENTS"]);

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));

    const item = await screen.findByRole("menuitem", { name: "Remove" });

    expect(item.getAttribute("aria-disabled")).toBe("true");
  });

  it("moves a metric right, and left, from its ellipsis menu", async () => {
    const { onMetricsChange } = renderStrip(["EVENTS", "SPANS"]);

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Move right" }),
    );

    expect(onMetricsChange).toHaveBeenLastCalledWith(["SPANS", "EVENTS"]);

    fireEvent.click(screen.getByRole("button", { name: "Spans options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));

    expect(onMetricsChange).toHaveBeenLastCalledWith(["SPANS", "EVENTS"]);
  });

  it("does nothing on a change without a handler", async () => {
    render(<MetricSelectStrip metrics={["EVENTS", "SPANS"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(screen.getByTestId("metric-select-strip")).toBeDefined();
  });
});
