import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getMetric } from "../../../../../../testing/metrics/metric-catalog";

import { TotalsChange } from "./totals-change";

describe(TotalsChange, () => {
  it("abbreviates a long previous duration and keeps the full words reachable", () => {
    render(
      <TotalsChange
        metric={getMetric("duration")}
        previous={525_600 + 43_200 + 4320 + 720}
        value={600_000}
        showPrevious
      />,
    );

    const change = screen.getByTestId("totals-change");

    expect(change.textContent).toContain("vs 1 y 1 mo 3 d");
    expect(change.querySelector("[title]")?.getAttribute("title")).toBe(
      "1 year, 1 month, 3 days, 12 hours",
    );
    expect(change.querySelector(".sr-only:last-child")?.textContent).toBe(
      "vs 1 year, 1 month, 3 days, 12 hours",
    );
  });

  it("shows nothing without a previous value", () => {
    render(
      <TotalsChange
        metric={getMetric("events")}
        previous={null}
        value={10}
      />,
    );

    expect(screen.queryByTestId("totals-change")).toBeNull();
  });

  it("shows a rise with its percent", () => {
    render(
      <TotalsChange
        className="totals-change"
        metric={getMetric("events")}
        previous={8}
        value={10}
      />,
    );

    const change = screen.getByTestId("totals-change");

    expect(change.textContent).toContain("Up");
    expect(change.textContent).toContain("+25%");
    expect(change.className).toContain("totals-change");
  });

  it("shows a fall and the previous value when asked", () => {
    render(
      <TotalsChange
        metric={getMetric("events")}
        previous={20}
        value={10}
        showPrevious
      />,
    );

    const change = screen.getByTestId("totals-change");

    expect(change.textContent).toContain("Down");
    expect(change.textContent).toContain("-50%");
    expect(change.textContent).toContain("vs 20");
  });

  it("shows no change", () => {
    render(
      <TotalsChange
        metric={getMetric("events")}
        previous={10}
        value={10}
      />,
    );

    expect(screen.getByTestId("totals-change").textContent).toContain(
      "Unchanged",
    );
  });

  it("falls back to the change in units when the previous was zero", () => {
    render(
      <TotalsChange
        metric={getMetric("events")}
        previous={0}
        value={5}
      />,
    );

    expect(screen.getByTestId("totals-change").textContent).toContain("+5");
  });
});
