import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChartsNotice } from "./charts-notice";

describe(ChartsNotice, () => {
  it("draws the bars while the metrics load", () => {
    render(
      <ChartsNotice
        error={undefined}
        kind="loading"
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByTestId("skeleton-bars")).toBeDefined();
  });

  it("says why the metrics could not be read, and offers a retry", () => {
    const onRetry = vi.fn<() => void>();

    render(
      <ChartsNotice
        error={new Error("The metrics are down")}
        kind="error"
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByRole("alert").textContent).toContain(
      "The metrics are down",
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("says so when the error is not known", () => {
    render(
      <ChartsNotice
        error={undefined}
        kind="error"
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText("The metrics could not be read")).toBeDefined();
  });

  it("says there is nothing to chart", () => {
    render(
      <ChartsNotice
        error={undefined}
        kind="empty"
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText("Nothing to chart")).toBeDefined();
  });
});
