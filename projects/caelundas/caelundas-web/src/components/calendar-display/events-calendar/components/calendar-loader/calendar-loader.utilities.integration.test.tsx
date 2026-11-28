import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { findDayCell } from "../../../../../../testing/calendar/calendar-page";
import {
  filterGroup,
  filterLink,
  tagRule,
} from "../../../../../../testing/event-filters";
import { renderCalendarRoute } from "../../../../../../testing/render-route";

// The states the calendar falls back to, tested through the `/` route; they
// live apart from the route's own tests only to keep each file short.
describe("calendar states", () => {
  it("clears the filters from the notice that blames them", async () => {
    await renderCalendarRoute(
      filterLink(
        "2026-04-01",
        filterGroup("and", tagRule("body", "is_any_of", ["mercury"])),
      ),
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Clear filters" }),
    );

    await waitFor(() => {
      expect(screen.queryByText("No events match the filters")).toBeNull();
    });

    await expect(findDayCell("2026-04-10")).resolves.toBeDefined();
  });
});
