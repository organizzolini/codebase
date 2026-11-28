import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { serveCalendarApi } from "../../../../testing/calendar/calendar-api";
import { renderWithCatalog } from "../../../../testing/metrics/metric-catalog";

import { CalendarTotals } from "./calendar-totals";

import type { CalendarTotalsProperties } from "./calendar-totals";

function clickFirstAlpha(): void {
  for (const button of screen
    .getAllByRole("button", { name: /Alpha/ })
    .slice(0, 1)) {
    fireEvent.click(button);
  }
}

function createProperties(
  overrides: Partial<CalendarTotalsProperties> = {},
): CalendarTotalsProperties {
  return {
    anchor: new Date("2026-03-01T12:00:00.000Z"),
    compare: false,
    filter: undefined,
    grouping: [{ field: "tag:body" }, { field: "tag:body" }],
    metrics: ["events", "unique-names"],
    onDateChange: vi.fn<(date: Date) => void>(),
    onNavigationChange: vi.fn<() => void>(),
    sort: undefined,
    timeZone: "America/New_York",
    ...overrides,
  };
}

describe(CalendarTotals, () => {
  it("applies its class name", () => {
    serveCalendarApi();
    render(
      <CalendarTotals
        {...createProperties()}
        className="calendar-totals"
      />,
    );

    expect(screen.getByTestId("calendar-totals").className).toBe(
      "calendar-totals",
    );
  });

  it("shows a skeleton while loading", () => {
    serveCalendarApi();
    renderWithCatalog(<CalendarTotals {...createProperties()} />);

    expect(screen.getByTestId("skeleton-cards")).toBeDefined();
  });

  it("names its container by what the skeleton announces while loading, and no longer once it has cards", async () => {
    serveCalendarApi();
    renderWithCatalog(<CalendarTotals {...createProperties()} />);

    expect(screen.getByRole("region", { name: "Loading totals" })).toBe(
      screen.getByTestId("calendar-totals"),
    );
    expect(screen.getAllByText("Loading totals")).toHaveLength(1);

    await waitFor(() => {
      expect(screen.getAllByTestId("totals-card")).toHaveLength(2);
    });

    expect(screen.queryByRole("region", { name: "Loading totals" })).toBeNull();
    expect(
      screen.getByTestId("calendar-totals").hasAttribute("aria-labelledby"),
    ).toBe(false);
  });

  it("shows a card for each metric with its total", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarTotals {...createProperties()} />);

    await waitFor(() => {
      expect(screen.getAllByTestId("totals-card")).toHaveLength(2);
    });

    const [events, names] = screen.getAllByTestId("totals-value");

    expect(events?.textContent).toBe("10");
    expect(names?.textContent).toBe("20");
    expect(screen.queryByTestId("totals-change")).toBeNull();
  });

  it("shows the change against the period before when compared", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(
      <CalendarTotals {...createProperties({ compare: true })} />,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("totals-change").length).toBeGreaterThan(0);
    });
  });

  it("colors the groups by their keys", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(
      <CalendarTotals
        {...createProperties({
          groupColors: new Map([["alpha", "rgb(1, 2, 3)"]]),
        })}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("totals-swatch")[0]?.style.background).toBe(
        "rgb(1, 2, 3)",
      );
    });
  });

  it("lists only the top-level groups until one is opened, as the charts do", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarTotals {...createProperties()} />);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Alpha/ })).toHaveLength(2);
    });

    expect(screen.getAllByRole("button", { name: /Beta/ })).toHaveLength(2);
    expect(screen.queryByText("One")).toBeNull();
    expect(
      screen
        .getAllByRole("button", { name: /Alpha/ })[0]
        ?.getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("opens a group into its subgroups, and closes it again", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarTotals {...createProperties()} />);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Alpha/ })).toHaveLength(2);
    });

    clickFirstAlpha();

    await waitFor(() => {
      expect(screen.getAllByText("One").length).toBeGreaterThan(0);
    });

    // The open group's header stays above the subgroups it opened into.
    expect(
      screen
        .getAllByRole("button", { name: /Alpha/ })[0]
        ?.getAttribute("aria-expanded"),
    ).toBe("true");

    clickFirstAlpha();

    await waitFor(() => {
      expect(screen.queryByText("One")).toBeNull();
    });
  });

  it("nests the subtotals in a card, with no more card or sum", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(<CalendarTotals {...createProperties()} />);

    await waitFor(() => {
      expect(screen.getAllByTestId("totals-subtotal")).toHaveLength(4);
    });

    expect(screen.queryByTestId("totals-more")).toBeNull();
    expect(screen.queryByTestId("totals-sums-to")).toBeNull();
  });

  it("says when there are no totals", async () => {
    expect.hasAssertions();

    serveCalendarApi();
    renderWithCatalog(
      <CalendarTotals {...createProperties({ metrics: [] })} />,
    );

    await expect(
      screen.findByText("There are no totals to show for these days."),
    ).resolves.toBeDefined();
  });

  it("says why the metrics could not be read, and retries", async () => {
    expect.hasAssertions();

    const api = serveCalendarApi({ metricsError: "The metrics are down" });

    renderWithCatalog(<CalendarTotals {...createProperties()} />);

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toContain("The metrics are down");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(api.requests.metrics).toHaveLength(2);
    });
  });
});
