import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { findToolbar } from "../../../../testing/calendar/calendar-page";
import { renderCalendarRoute } from "../../../../testing/render-route";
import { getRouter } from "../../../router";

vi.mock(import("../../../router"), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    getRouter: vi.fn<typeof original.getRouter>(() => original.getRouter()),
  };
});

/**
 * Opens the picker from the toolbar's title, the period it shows.
 */
async function openFromTitle(): Promise<void> {
  const toolbar = await findToolbar();
  const title = await screen.findByRole("button", {
    name: /^2026-03-01 – 2026-03-30$/u,
  });

  expect(toolbar.contains(title)).toBe(true);

  fireEvent.click(title);
  await screen.findByTestId("date-picker-panel");
}

/**
 * The search of the router the last render was given.
 */
function readSearch(): Readonly<Record<string, unknown>> {
  const router: ReturnType<typeof getRouter> | undefined = vi
    .mocked(getRouter)
    .mock.results.at(-1)?.value;

  return router?.state.location.search ?? {};
}

vi.setConfig({ testTimeout: 30_000 });

describe("date picker in the toolbar", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens from the title and applies a quarter to the table's window", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-01&days=30");
    await openFromTitle();
    fireEvent.click(screen.getByRole("button", { name: "Quarter" }));
    fireEvent.click(screen.getByRole("button", { name: "Q2" }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({
        date: "2026-04-01",
        days: 91,
        view: "table",
      });
    });
    await waitFor(() => {
      expect(screen.queryByTestId("date-picker-panel")).toBeNull();
    });
  });

  it("picks a whole month from the grid at once", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-01&days=30");
    await openFromTitle();
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    fireEvent.click(screen.getByRole("button", { name: "Apr" }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ date: "2026-04-01", days: 30 });
    });
  });

  it("applies a day's range with two clicks, closing on the second", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-01&days=30");
    await openFromTitle();
    fireEvent.click(screen.getByRole("button", { name: /March 10th, 2026/u }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ date: "2026-03-10", days: 1 });
    });

    expect(screen.queryByTestId("date-picker-panel")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /March 20th, 2026/u }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ date: "2026-03-10", days: 11 });
    });
    await waitFor(() => {
      expect(screen.queryByTestId("date-picker-panel")).toBeNull();
    });
  });

  it("applies a week from its chip", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-01&days=30");
    await openFromTitle();
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    fireEvent.click(screen.getByRole("button", { name: "Mar 8 – 14" }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ date: "2026-03-08", days: 7 });
    });
  });

  it("offers no Day or Week mode in the month layout", async () => {
    await renderCalendarRoute("/?view=month&date=2026-03-15");
    await findToolbar();
    fireEvent.click(
      within(await screen.findByTestId("calendar-date-picker")).getByRole(
        "button",
      ),
    );
    await screen.findByTestId("date-picker-panel");

    expect(screen.queryByRole("button", { name: "Day" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Week" })).toBeNull();
    expect(screen.getByRole("button", { name: "Quarter" })).toBeDefined();
    expect(screen.queryByTestId("date-picker-presets")).toBeNull();
    expect(screen.queryByTestId("date-picker-time-fields")).toBeNull();
  });

  it("opens from the Date item of the Filter list", async () => {
    await renderCalendarRoute("/?view=table&date=2026-03-01&days=30");

    await findToolbar();
    fireEvent.click(
      await screen.findByRole("button", { name: /^Filter(,|$)/u }),
    );
    fireEvent.click(await screen.findByText("The days the view shows"));

    await expect(
      screen.findByTestId("date-picker-panel"),
    ).resolves.toBeDefined();
  });
});
