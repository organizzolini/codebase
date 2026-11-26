import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MetricsPending } from "./metrics-pending";

describe(MetricsPending, () => {
  it("draws the skeleton of the Charts, named by what it announces, while loading", () => {
    render(
      <MetricsPending
        className="pending"
        error={undefined}
        onRetry={vi.fn<() => void>()}
        view="charts"
        isLoading
      />,
    );

    const region = screen.getByRole("region", { name: "Loading charts" });

    expect(region.className).toBe("pending");
    expect(region.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByTestId("skeleton-bars")).toBeDefined();
  });

  it("draws the skeleton of the Totals for the totals view", () => {
    render(
      <MetricsPending
        error={undefined}
        onRetry={vi.fn<() => void>()}
        view="totals"
        isLoading
      />,
    );

    expect(
      screen.getByRole("region", { name: "Loading totals" }),
    ).toBeDefined();
    expect(screen.getByTestId("skeleton-cards")).toBeDefined();
  });

  it("says why the catalog could not be read, and offers a retry", () => {
    const onRetry = vi.fn<() => void>();

    render(
      <MetricsPending
        error={new Error("The catalog is down")}
        isLoading={false}
        onRetry={onRetry}
        view="charts"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByRole("alert").textContent).toContain(
      "The catalog is down",
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("region")).toBeNull();
    expect(
      screen.getByTestId("calendar-metrics").getAttribute("aria-busy"),
    ).toBe("false");
  });
});
