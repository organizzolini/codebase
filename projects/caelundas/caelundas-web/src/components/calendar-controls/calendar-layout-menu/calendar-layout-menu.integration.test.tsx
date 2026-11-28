import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  findLayoutOption,
  pickCalendarView,
  pickTimelineScale,
  readCalendarView,
} from "../../../../testing/calendar/calendar-page";
import { renderCalendarRoute } from "../../../../testing/render-route";
import { getRouter } from "../../../router";

// The route helper keeps no router, so the one each render builds is kept for
// its location.
vi.mock(import("../../../router"), async (importOriginal) => {
  const original = await importOriginal();

  return { ...original, getRouter: vi.fn(() => original.getRouter()) };
});

/**
 * The search of the router the last render was given.
 */
function readSearch(): Readonly<Record<string, unknown>> {
  const router = vi.mocked(getRouter).mock.results.at(-1)?.value;

  return router?.state.location.search ?? {};
}

// Each test renders the whole route, which a loaded continuous integration
// runner needs seconds for.
vi.setConfig({ testTimeout: 30_000 });

describe("layout menu", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens the timeline's scales on selecting it and keeps them", async () => {
    await renderCalendarRoute("/?date=2026-03-01&view=table");
    await findLayoutOption("Table");

    expect(screen.queryByRole("treeitem", { name: /^Quarter/u })).toBeNull();

    fireEvent.click(await findLayoutOption("Timeline"));

    await expect(findLayoutOption("Quarter")).resolves.toBeTruthy();

    fireEvent.click(await findLayoutOption("Table"));

    await waitFor(() => {
      expect(screen.queryByRole("treeitem", { name: /^Quarter/u })).toBeNull();
    });
  });

  it("writes the layout and the timeline's scale to the link, and the chip names the layout", async () => {
    await renderCalendarRoute("/?date=2026-03-01&view=table");
    await pickCalendarView("Timeline");

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ view: "timeline" });
    });

    await expect(readCalendarView()).resolves.toBe("Timeline");

    await pickTimelineScale("Quarter");

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ scale: "quarter" });
    });
  });
});
