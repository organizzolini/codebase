import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { readServedApi, serveCalendarApi } from "../../testing/calendar-api";
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
import { renderCalendarRoute } from "../../testing/render-route";
import { setViewportWidth } from "../../testing/viewport";
import { getRouter } from "../router";

import { Route } from "./index";

// The route helper builds its own router, so the one it built is kept for
// a test that navigates it.
vi.mock(import("../router"), async (importOriginal) => {
  const original = await importOriginal();

  return { ...original, getRouter: vi.fn(original.getRouter) };
});

/**
 * The router the last render of a route was given.
 */
function getRenderedRouter(): ReturnType<typeof getRouter> {
  const router = vi.mocked(getRouter).mock.results.at(-1)?.value;

  if (router === undefined) {
    throw new Error("No route has been rendered");
  }

  return router;
}

// Each click of the View menu re-renders the whole route, which a slow
// continuous integration runner needs well past the default time for: a
// loaded runner passed 15 seconds on the menus' test, so the limit is three
// times that.
vi.setConfig({ testTimeout: 45_000 });

describe("index", () => {
  it("renders its page", async () => {
    serveCalendarApi();

    await renderRoute(getRouter(), "/");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/");
  });

  it("shows the requested month as a grid under one toolbar row", async () => {
    await renderCalendarRoute("/?date=2026-03-01");

    const grid = await screen.findByRole("grid", { name: "March 2026" });
    const toolbar = screen.getByTestId("calendar-toolbar");

    expect(grid).toBeDefined();
    expect(
      within(toolbar).getByRole("button", { name: /Next/u }),
    ).toBeDefined();
    expect(
      within(within(toolbar).getByRole("group", { name: "View" })).getByRole(
        "button",
        {
          name: "Month",
          pressed: true,
        },
      ),
    ).toBeDefined();
  });

  it("shows each event at its time in the observer's zone", async () => {
    await renderCalendarRoute("/?date=2026-03-01");

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
    await renderCalendarRoute("/?date=2026-03-01");

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
    await renderCalendarRoute("/?date=2026-03-01");

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
    await renderCalendarRoute("/?date=2025-01-01");

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
    await renderCalendarRoute("/?date=2030-01-01");

    await screen.findByRole("grid", { name: "January 2030" });

    fireEvent.click(screen.getByRole("button", { name: "Go to Jun 21, 2026" }));

    await expect(
      screen.findByRole("button", { name: /^Sun Ingress Cancer/u }),
    ).resolves.toBeDefined();
  });

  it("says when a month inside the data holds no events", async () => {
    await renderCalendarRoute("/?date=2026-05-01");

    await screen.findByRole("grid", { name: "May 2026" });

    expect(screen.getByText("No events this month")).toBeDefined();
    expect(screen.queryByText("Outside the data")).toBeNull();
  });

  it("shows a skeleton while the API answers", async () => {
    await renderCalendarRoute("/?date=2026-03-01", {
      api: { hang: true },
      waitForLoad: false,
    });

    await expect(
      screen.findByRole("status", { name: "Loading events" }),
    ).resolves.toBeDefined();
  });

  it("shows an error that retries when the API fails", async () => {
    const api = serveCalendarApi();

    api.fail("The API answered 404");
    await renderCalendarRoute("/?date=2026-03-01", { api });

    await expect(
      screen.findByText("The events could not be loaded"),
    ).resolves.toBeDefined();

    api.recover();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it("opens on today when the date in the link is not a date", async () => {
    await renderCalendarRoute("/?date=2026-02-30");

    const today = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    await expect(
      screen.findByRole("grid", { name: today }),
    ).resolves.toBeDefined();
  });

  it("says when the API holds no events at all", async () => {
    await renderCalendarRoute("/?date=2026-03-01", {
      api: { events: [], tags: [] },
    });

    await screen.findByRole("grid", { name: "March 2026" });

    expect(screen.getByText("No events yet")).toBeDefined();
    expect(
      screen.queryAllByRole("button", { name: /Conjunct|Ingress/u }),
    ).toHaveLength(0);
  });

  it("restores the filters a link holds", async () => {
    await renderCalendarRoute(
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
    await renderCalendarRoute(
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
    await renderCalendarRoute(
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
    await renderCalendarRoute(
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
    await renderCalendarRoute(
      filterLink("2026-03-01", { combinator: "xor", type: "group" }),
    );

    await expect(
      screen.findByRole("button", { name: /^Sun Ingress Aries/u }),
    ).resolves.toBeDefined();
  });

  it("ignores the rules that are not finished", async () => {
    await renderCalendarRoute(
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
      await renderCalendarRoute("/?date=2026-03-01");

      const toolbar = await findToolbar();

      expect(screen.queryByText("No filters yet")).toBeNull();

      fireEvent.click(
        within(toolbar).getByRole("button", { name: /^Filter(,|$)/u }),
      );

      const builder = await screen.findByRole("dialog", { name: "Filter" });

      expect(builder.closest(`[data-slot="${viewport.slot}"]`)).not.toBeNull();
      expect(within(builder).getByText("No filters yet")).toBeDefined();
    },
  );

  it(
    "filters the calendar with a rule built in the builder",
    BUILDER_TEST,
    async () => {
      await renderCalendarRoute("/?date=2026-03-01");
      await startFilterRule(/^Planet(?!-)/u, "is any of");
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
      await renderCalendarRoute(
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
      const chips = within(toolbar).getByRole("toolbar", { name: "Filter" });

      expect(
        within(toolbar).getByRole("button", { name: "Filter, 2 active" }),
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
          screen.getByRole("button", { name: "Filter, 1 active" }),
        ).toBeDefined();
      }, BUILDER_WAIT);
    },
  );

  it("collapses the chips into the count on a phone", async () => {
    setViewportWidth(375);
    await renderCalendarRoute(
      filterLink(
        "2026-03-01",
        filterGroup("and", tagRule("planet", "is_any_of", ["venus"])),
      ),
    );

    const toolbar = await findToolbar();

    expect(
      within(toolbar).getByRole("button", { name: "Filter, 1 active" }),
    ).toBeDefined();
    expect(within(toolbar).queryByRole("toolbar")).toBeNull();
  });

  it("turns the colors off from the Color menu and the grouping of crowded days from the View menu", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    await screen.findByRole("grid", { name: "March 2026" });

    const seen = new Set<string>();

    for (const [menu, role, name] of [
      ["Color options", "switch", "Color events"],
      ["View options", "menuitemcheckbox", "Group similar events"],
      ["Color options", "switch", "Color events"],
      ["View options", "menuitemcheckbox", "Group similar events"],
    ] as const) {
      fireEvent.click(screen.getByRole("button", { name: menu }));
      fireEvent.click(await screen.findByRole(role, { name }));
      // A switch leaves its panel open, where a menu item closes its menu.
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
      await waitFor(() => {
        expect(screen.queryByRole(role, { name })).toBeNull();
      });

      // The link now says so, and the menu reads back what it holds.
      fireEvent.click(screen.getByRole("button", { name: menu }));
      await waitFor(() => {
        expect(
          screen.getByRole(role, { name }).getAttribute("aria-checked"),
        ).toBe(seen.has(name) ? "true" : "false");
      });
      seen.add(name);
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
    }
  });

  it("switches the symbols to emojis and back from the View menu", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    await screen.findByRole("heading", { level: 1 });

    for (const name of ["Emojis", "Glyphs"]) {
      fireEvent.click(screen.getByRole("button", { name: "View options" }));
      fireEvent.click(await screen.findByRole("menuitemradio", { name }));

      // The link now holds the pick, and the menu reads it back.
      fireEvent.click(screen.getByRole("button", { name: "View options" }));
      await waitFor(() => {
        expect(
          screen
            .getByRole("menuitemradio", { name })
            .getAttribute("aria-checked"),
        ).toBe("true");
      });
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
    }
  });

  it("searches the events' text from a link", async () => {
    await renderCalendarRoute(
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
      await renderCalendarRoute("/?date=2026-03-01");
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

  describe("sky link parameters", () => {
    it("keeps them through the calendar's own navigation", async () => {
      await renderCalendarRoute("/?date=2026-03-01&sky.lat=51.5");
      const router = getRenderedRouter();
      const toolbar = await findToolbar();

      fireEvent.click(within(toolbar).getByRole("button", { name: /Next/u }));

      await screen.findByRole("grid", { name: "April 2026" });

      expect(router.state.location.search).toMatchObject({
        date: "2026-04-01",
        "sky.lat": 51.5,
      });
    });

    it("does not run the loader again for a change to them alone", async () => {
      await renderCalendarRoute("/?date=2026-03-01");
      const api = readServedApi();
      const router = getRenderedRouter();

      await screen.findByRole("grid", { name: "March 2026" });

      // The loader caches its event reads, so it is the windows it asks the
      // API for, on every load, that show the loader ran.
      const loads = api.requests.windows.length;

      await router.navigate({
        search: (previous) => ({ ...previous, "sky.lat": 51.5 }),
        to: "/",
      });

      expect(api.requests.windows).toHaveLength(loads);
      expect(router.state.location.search).toMatchObject({ "sky.lat": 51.5 });
    });

    it("still runs the loader for a change to the calendar", async () => {
      await renderCalendarRoute("/?date=2026-03-01&sky.lat=51.5");
      const api = readServedApi();
      const router = getRenderedRouter();

      await screen.findByRole("grid", { name: "March 2026" });

      const loads = api.requests.windows.length;

      await router.navigate({
        search: (previous) => ({ ...previous, date: "2026-04-01" }),
        to: "/",
      });

      await waitFor(() => {
        expect(api.requests.windows.length).toBeGreaterThan(loads);
      });
    });
  });
});
