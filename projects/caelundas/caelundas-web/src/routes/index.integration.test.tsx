import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  BUILDER_TEST,
  BUILDER_WAIT,
  findToolbar,
  pickOption,
  startFilterRule,
} from "../../testing/calendar-page";
import {
  fieldRule,
  filterGroup,
  filterLink,
  tagRule,
} from "../../testing/event-filters";
import {
  createFailingEventsDatabase,
  createTestEventsDatabase,
} from "../../testing/events-database";
import { renderRoute } from "../../testing/render-route";
import { setViewportWidth } from "../../testing/viewport";
import { UnsupportedBrowserError } from "../lib/events-database/events-database.errors";

import { Route } from "./index";

describe("index", () => {
  it("renders its page", async () => {
    await renderRoute("/");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/");
  });

  it("shows the requested month as a grid under one toolbar row", async () => {
    await renderRoute("/?date=2026-03-01");

    const grid = await screen.findByRole("grid", { name: "March 2026" });
    const toolbar = screen.getByTestId("calendar-toolbar");

    expect(grid).toBeDefined();
    expect(
      within(toolbar).getByRole("button", { name: /Next/u }),
    ).toBeDefined();
    expect(
      within(within(toolbar).getByRole("group", { name: "View" })).getByRole(
        "button",
        { name: "Month", pressed: true },
      ),
    ).toBeDefined();
  });

  it("shows each event at its time in the observer's zone", async () => {
    await renderRoute("/?date=2026-03-01");

    const event = await screen.findByRole("button", {
      name: /^Mars Conjunct Venus, 10:20\sAM/u,
    });

    expect(
      within(event).getByText(
        "Planet / Mars; Planet / Venus; Type / Aspect / Major Aspect / Conjunct. Instant",
      ),
    ).toBeDefined();
  });

  it("tells a span apart from an instant by its derived duration", async () => {
    await renderRoute("/?date=2026-03-01");

    const [span] = await screen.findAllByRole("button", {
      name: /^Mercury Retrograde/u,
    });

    expect(span).toBeDefined();
    expect(
      within(span ?? document.body).getByText(
        "Planet / Mercury; Type / Retrograde. 22 days, 12 hours, 44 minutes",
      ),
    ).toBeDefined();
  });

  it("moves to the next month and reads its events", async () => {
    await renderRoute("/?date=2026-03-01");

    const toolbar = await findToolbar();

    fireEvent.click(within(toolbar).getByRole("button", { name: /Next/u }));

    await expect(
      screen.findByRole("grid", { name: "April 2026" }),
    ).resolves.toBeDefined();
    await expect(
      screen.findByRole("button", { name: /^Mars Square Saturn/u }),
    ).resolves.toBeDefined();
  });

  it("offers the covered dates for a month outside the data", async () => {
    await renderRoute("/?date=2025-01-01");

    await screen.findByRole("grid", { name: "January 2025" });

    expect(screen.getByText("Outside the data")).toBeDefined();
    expect(
      screen.getByText("Events run from Feb 26, 2026 to Jun 21, 2026."),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Go to Feb 26, 2026" }));

    await expect(
      screen.findByRole("grid", { name: "February 2026" }),
    ).resolves.toBeDefined();
    expect(screen.queryByText("Outside the data")).toBeNull();
  });

  it("offers the last covered day for a month after the data", async () => {
    await renderRoute("/?date=2030-01-01");

    await screen.findByRole("grid", { name: "January 2030" });

    fireEvent.click(screen.getByRole("button", { name: "Go to Jun 21, 2026" }));

    await expect(
      screen.findByRole("button", { name: /^Sun Ingress Cancer/u }),
    ).resolves.toBeDefined();
  });

  it("says when a month inside the data holds no events", async () => {
    await renderRoute("/?date=2026-05-01");

    await screen.findByRole("grid", { name: "May 2026" });

    expect(screen.getByText("No events this month")).toBeDefined();
    expect(screen.queryByText("Outside the data")).toBeNull();
  });

  it("shows a skeleton while the database loads", async () => {
    await renderRoute("/?date=2026-03-01", {
      eventsDatabase: {
        describeDataset: async () => new Promise(() => {}),
        findEvents: async () => new Promise(() => {}),
        findFacets: async () => new Promise(() => {}),
      },
      waitForLoad: false,
    });

    await expect(
      screen.findByRole("status", { name: "Loading events" }),
    ).resolves.toBeDefined();
  });

  it("shows an error that retries when the database fails", async () => {
    const { database, recover } = createFailingEventsDatabase(
      new Error("The events database answered 404"),
    );

    await renderRoute("/?date=2026-03-01", { eventsDatabase: database });

    await expect(
      screen.findByText("The events could not be loaded"),
    ).resolves.toBeDefined();

    recover();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it("explains a browser without WebAssembly or Workers", async () => {
    const { database } = createFailingEventsDatabase(
      new UnsupportedBrowserError(),
    );

    await renderRoute("/?date=2026-03-01", { eventsDatabase: database });

    await expect(
      screen.findByText("This browser cannot run the calendar"),
    ).resolves.toBeDefined();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("opens on today when the date in the link is not a date", async () => {
    await renderRoute("/?date=2026-02-30");

    const today = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    await expect(
      screen.findByRole("grid", { name: today }),
    ).resolves.toBeDefined();
  });

  it("says when the database holds no events at all", async () => {
    await renderRoute("/?date=2026-03-01", {
      eventsDatabase: createTestEventsDatabase({ empty: true }),
    });

    await screen.findByRole("grid", { name: "March 2026" });

    expect(screen.getByText("No events yet")).toBeDefined();
    expect(
      screen.queryAllByRole("button", { name: /Conjunct|Ingress/u }),
    ).toHaveLength(0);
  });

  it("restores the filters a link holds", async () => {
    await renderRoute(
      filterLink(
        "2026-03-01",
        filterGroup("and", tagRule("planet", "is_any_of", ["venus"])),
      ),
    );

    await expect(
      screen.findByRole("button", { name: /^Venus Ingress Aries/u }),
    ).resolves.toBeDefined();
    expect(
      screen.getByRole("button", { name: /^Mars Conjunct Venus/u }),
    ).toBeDefined();
    expect(
      screen.queryByRole("button", { name: /^Sun Ingress Aries/u }),
    ).toBeNull();
    expect(screen.queryAllByRole("button", { name: /^Mercury/u })).toHaveLength(
      0,
    );
  });

  it("keeps the filters when moving to another month", async () => {
    await renderRoute(
      filterLink(
        "2026-03-01",
        filterGroup("and", tagRule("planet", "is_any_of", ["mercury"])),
      ),
    );

    const toolbar = await findToolbar();

    fireEvent.click(within(toolbar).getByRole("button", { name: /Next/u }));

    await screen.findByRole("grid", { name: "April 2026" });

    await expect(
      screen.findByText("No events match the filters"),
    ).resolves.toBeDefined();
    expect(
      screen.queryByRole("button", { name: /^Mars Square Saturn/u }),
    ).toBeNull();
  });

  it("does not blame the filters for a month with no events at all", async () => {
    await renderRoute(
      filterLink(
        "2026-05-01",
        filterGroup("and", tagRule("planet", "is_any_of", ["venus"])),
      ),
    );

    await expect(
      screen.findByText("No events this month"),
    ).resolves.toBeDefined();
    expect(screen.queryByText("No events match the filters")).toBeNull();
  });

  it("restores nested groups and negated rules from a link", async () => {
    await renderRoute(
      filterLink(
        "2026-03-01",
        filterGroup(
          "and",
          filterGroup(
            "or",
            tagRule("planet", "is_any_of", ["sun"]),
            tagRule("planet", "is_any_of", ["venus"]),
          ),
          { ...tagRule("type", "is_any_of", ["aspect"]), negated: true },
        ),
      ),
    );

    await expect(
      screen.findByRole("button", { name: /^Venus Ingress Aries/u }),
    ).resolves.toBeDefined();
    expect(
      screen.queryByRole("button", { name: /^Mars Conjunct Venus/u }),
    ).toBeNull();
  });

  it("ignores a filter in the link that does not parse", async () => {
    await renderRoute(
      filterLink("2026-03-01", { combinator: "xor", type: "group" }),
    );

    await expect(
      screen.findByRole("button", { name: /^Sun Ingress Aries/u }),
    ).resolves.toBeDefined();
  });

  it("ignores the rules that are not finished", async () => {
    await renderRoute(
      filterLink(
        "2026-03-01",
        filterGroup("and", tagRule("planet", "is_any_of", [])),
      ),
    );

    await expect(
      screen.findByRole("button", { name: /^Sun Ingress Aries/u }),
    ).resolves.toBeDefined();
    expect(screen.queryByText("No events match the filters")).toBeNull();
  });

  it.each([
    { size: "a desktop", slot: "popover-content", width: 1280 },
    { size: "a tablet", slot: "drawer-popup", width: 800 },
    { size: "a phone", slot: "sheet-content", width: 375 },
  ])(
    "opens the filter builder over the calendar on $size",
    async (viewport) => {
      setViewportWidth(viewport.width);
      await renderRoute("/?date=2026-03-01");

      const toolbar = await findToolbar();

      expect(screen.queryByText("No filters yet")).toBeNull();

      fireEvent.click(
        within(toolbar).getByRole("button", { name: /^Filters/u }),
      );

      const builder = await screen.findByRole("dialog", { name: "Filters" });

      expect(builder.closest(`[data-slot="${viewport.slot}"]`)).not.toBeNull();
      expect(within(builder).getByText("No filters yet")).toBeDefined();
    },
  );

  it(
    "filters the calendar with a rule built in the builder",
    BUILDER_TEST,
    async () => {
      await renderRoute("/?date=2026-03-01");
      await startFilterRule(/^Planet/u, "is any of");
      await pickOption(/^Mercury/u);
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });

      // Both at once, so the skeleton a slow reload shows cannot pass for it.
      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: /^Mercury Retrograde/u }),
        ).not.toHaveLength(0);
        expect(
          screen.queryByRole("button", { name: /^Sun Ingress Aries/u }),
        ).toBeNull();
      }, BUILDER_WAIT);
    },
  );

  it(
    "shows the active filters as chips beside a count",
    BUILDER_TEST,
    async () => {
      await renderRoute(
        filterLink(
          "2026-03-01",
          filterGroup(
            "and",
            tagRule("planet", "is_any_of", ["venus"]),
            tagRule("sign", "is_any_of", ["aries"]),
            tagRule("type", "is_any_of", []),
          ),
        ),
      );

      const toolbar = await findToolbar();
      const chips = within(toolbar).getByRole("toolbar", { name: "Filters" });

      expect(
        within(toolbar).getByRole("button", { name: "Filters, 2 active" }),
      ).toBeDefined();
      expect(within(chips).getAllByText(/^(Planet|Sign|Type)$/u)).toHaveLength(
        3,
      );

      fireEvent.click(
        within(chips).getByRole("button", { name: "Sign filter options" }),
      );
      fireEvent.click(
        await screen.findByRole("menuitem", { name: "Remove" }, BUILDER_WAIT),
      );

      // Read afresh, since a slow reload may have drawn a new toolbar.
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /^Mars Conjunct Venus/u }),
        ).toBeDefined();
        expect(
          screen.getByRole("button", { name: "Filters, 1 active" }),
        ).toBeDefined();
      }, BUILDER_WAIT);
    },
  );

  it("collapses the chips into the count on a phone", async () => {
    setViewportWidth(375);
    await renderRoute(
      filterLink(
        "2026-03-01",
        filterGroup("and", tagRule("planet", "is_any_of", ["venus"])),
      ),
    );

    const toolbar = await findToolbar();

    expect(
      within(toolbar).getByRole("button", { name: "Filters, 1 active" }),
    ).toBeDefined();
    expect(within(toolbar).queryByRole("toolbar")).toBeNull();
  });

  it("searches the events' text from a link", async () => {
    await renderRoute(
      filterLink(
        "2026-03-01",
        filterGroup("and", fieldRule("text", "contains", "ingress")),
      ),
    );

    await expect(
      screen.findByRole("button", { name: /^Sun Ingress Aries/u }),
    ).resolves.toBeDefined();
    expect(
      screen.queryByRole("button", { name: /^Mars Conjunct Venus/u }),
    ).toBeNull();
  });

  it(
    "filters by a date range picked in the builder",
    BUILDER_TEST,
    async () => {
      await renderRoute("/?date=2026-03-01");
      await startFilterRule(/^Date/u, "is between");
      fireEvent.change(
        await screen.findByLabelText("Date from", {}, BUILDER_WAIT),
        {
          target: { value: "2026-03-25" },
        },
      );
      fireEvent.change(screen.getByLabelText("Date to"), {
        target: { value: "2026-03-26" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Apply" }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /^Venus Ingress Aries/u }),
        ).toBeDefined();
        expect(
          screen.queryByRole("button", { name: /^Sun Ingress Aries/u }),
        ).toBeNull();
      }, BUILDER_WAIT);
    },
  );
});
