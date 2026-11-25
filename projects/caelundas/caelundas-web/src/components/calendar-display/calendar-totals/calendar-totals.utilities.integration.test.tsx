import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../testing/calendar-api";
import { BUILDER_WAIT } from "../../../../testing/calendar-page";
import { renderCalendarRoute } from "../../../../testing/render-route";
import { DEFAULT_METRICS } from "../calendar-metrics/calendar-metrics.constants";

// Each test renders the whole route, which a loaded continuous integration
// runner needs seconds for.
vi.setConfig({ testTimeout: 30_000 });

// The Totals are tested through the `/` route, the way the page uses them,
// with the mocked API's one small tree of metrics.
describe("totals layout", () => {
  it("shows a card for each default metric over the table's days", async () => {
    await renderCalendarRoute("/?view=totals&date=2026-03-04");

    await waitFor(() => {
      expect(screen.getAllByTestId("totals-card")).toHaveLength(
        DEFAULT_METRICS.totals.length,
      );
    }, BUILDER_WAIT);

    const events = screen.getByRole("article", { name: "Events" });

    expect(within(events).getByTestId("totals-value").textContent).toBe("10");
    expect(within(events).queryByTestId("totals-change")).toBeNull();
    expect(readServedApi().requests.metrics[0]?.compareToPrevious).toBe(false);
  });

  it("shows each metric's change when the link compares", async () => {
    await renderCalendarRoute("/?view=totals&date=2026-03-04&compare=true");

    const events = await screen.findByRole("article", { name: "Events" });

    await waitFor(() => {
      expect(
        within(events).getAllByTestId("totals-change")[0]?.textContent,
      ).toContain("vs 9");
    }, BUILDER_WAIT);
  });

  it("breaks each metric down by its top-level groups only, until a group is toggled", async () => {
    await renderCalendarRoute("/?view=totals&date=2026-03-04");

    const events = await screen.findByRole("article", { name: "Events" });

    await waitFor(() => {
      expect(
        within(events).getByRole("button", { name: /Alpha/ }),
      ).toBeDefined();
    }, BUILDER_WAIT);

    expect(
      within(events)
        .getByRole("button", { name: /Alpha/ })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    expect(within(events).getByRole("button", { name: /Beta/ })).toBeDefined();
    expect(within(events).queryByText("One")).toBeNull();

    fireEvent.click(within(events).getByRole("button", { name: /Alpha/ }));

    await waitFor(() => {
      expect(within(events).getAllByText("One").length).toBeGreaterThan(0);
    }, BUILDER_WAIT);

    // Beta stays as it was, a root.
    expect(
      within(events)
        .getByRole("button", { name: /Beta/ })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("nests an open group's subtotals in its card, shares the open group with the other metrics, with no sum line", async () => {
    await renderCalendarRoute("/?view=totals&date=2026-03-04");

    const events = await screen.findByRole("article", { name: "Events" });

    await waitFor(() => {
      expect(
        within(events).getByRole("button", { name: /Alpha/ }),
      ).toBeDefined();
    }, BUILDER_WAIT);

    fireEvent.click(within(events).getByRole("button", { name: /Alpha/ }));

    await waitFor(() => {
      expect(within(events).getAllByText("One").length).toBeGreaterThan(0);
    }, BUILDER_WAIT);

    // Nesting shows by the cards alone: no sum line beside them.
    expect(within(events).queryByTestId("totals-sums-to")).toBeNull();

    // The open group is the table's too, so another metric's card opens it as well.
    const names = screen.getByRole("article", { name: "Unique names" });

    expect(
      within(names)
        .getByRole("button", { name: /Alpha/ })
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("breaks a metric down by the table's groups, and opens and closes them", async () => {
    await renderCalendarRoute("/?view=totals&date=2026-03-04");

    const events = await screen.findByRole("article", { name: "Events" });

    await waitFor(() => {
      expect(
        within(events).getByRole("button", { name: /Alpha/ }),
      ).toBeDefined();
    }, BUILDER_WAIT);

    const group = within(events).getByRole("button", { name: /Alpha/ });
    const before = group.getAttribute("aria-expanded");

    fireEvent.click(group);

    await waitFor(() => {
      expect(
        within(events)
          .getByRole("button", { name: /Alpha/ })
          .getAttribute("aria-expanded"),
      ).not.toBe(before);
    }, BUILDER_WAIT);
  });
});
