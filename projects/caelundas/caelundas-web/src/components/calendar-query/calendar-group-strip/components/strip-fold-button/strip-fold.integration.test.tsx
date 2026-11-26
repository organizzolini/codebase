import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../../../testing/calendar-api";
import { BUILDER_WAIT } from "../../../../../../testing/calendar-page";
import {
  fieldRule,
  filterGroup,
} from "../../../../../../testing/event-filters";
import { renderCalendarRoute } from "../../../../../../testing/render-route";
import { getRouter } from "../../../../../router";

// The route helper builds its own router, so the one it built is kept to read the link from.
vi.mock(import("../../../../../router"), async (importOriginal) => {
  const original = await importOriginal();

  return { ...original, getRouter: vi.fn(original.getRouter) };
});

// Each test renders the whole route, which a loaded continuous integration runner needs seconds for.
vi.setConfig({ testTimeout: 45_000 });

const GROUP = encodeURIComponent(
  JSON.stringify([{ field: "year" }, { field: "month" }]),
);
const TABLE = `/?view=table&date=2026-03-01&days=30&group=${GROUP}`;
const FILTER = encodeURIComponent(
  JSON.stringify(filterGroup("and", fieldRule("text", "contains", "ingress"))),
);

/**
 * The strip of a test id, once drawn.
 */
async function findStrip(testId: string): Promise<HTMLElement> {
  return screen.findByTestId(testId, {}, BUILDER_WAIT);
}

/**
 * Folds a strip through the ellipsis menu of its chip, named by the label its button carries.
 */
async function foldFrom(strip: HTMLElement, label: string): Promise<void> {
  fireEvent.click(within(strip).getByRole("button", { name: label }));
  fireEvent.click(await screen.findByRole("menuitem", { name: "Fold" }));
}

/**
 * The link's search, as the router holds it.
 */
function readLink(): Record<string, unknown> {
  const router = vi.mocked(getRouter).mock.results.at(-1)?.value;

  if (router === undefined) {
    throw new Error("No route has been rendered");
  }

  return router.state.location.search;
}

describe("folding the query strips", () => {
  afterEach(() => {
    cleanup();
  });

  it("folds Select to its button and a count through a chip's menu, writing it to the link, and unfolds it again", async () => {
    await renderCalendarRoute(TABLE);

    const strip = await findStrip("calendar-select-strip");

    await within(strip).findByRole("button", { name: "Start options" });
    await foldFrom(strip, "Start options");

    const count = await within(strip).findByRole("button", {
      name: /3 Facets/u,
    });

    expect(count.getAttribute("aria-expanded")).toBe("false");
    expect(count.title).toBe("Name, Start, End");
    expect(within(strip).getAllByRole("button")).toHaveLength(2);
    expect(
      within(strip).queryByRole("button", { name: "Start options" }),
    ).toBeNull();
    expect(readLink()["fold"]).toBe("select");

    fireEvent.click(count);

    await within(strip).findByRole("button", { name: "Start options" });

    expect(readLink()["fold"]).toBeUndefined();
    expect(within(strip).queryByTestId("strip-fold-button")).toBeNull();
  });

  it("opens a shared link folded, as it was left, and folds Group and Select apart", async () => {
    await renderCalendarRoute(`${TABLE}&fold=select,group`);

    const group = await findStrip("calendar-group-strip");
    const select = await findStrip("calendar-select-strip");

    await waitFor(() => {
      expect(
        within(group).getByRole("button", { name: /2 Facets/u }).title,
      ).toBe("Year, Month");
    }, BUILDER_WAIT);

    expect(
      within(select).getByRole("button", { name: /3 Facets/u }),
    ).toBeDefined();

    fireEvent.click(within(group).getByRole("button", { name: /2 Facets/u }));

    await within(group).findByRole("button", { name: "Year options" });

    expect(readLink()["fold"]).toBe("select");
    expect(within(select).getByTestId("strip-fold-button")).toBeDefined();
  });

  it("folds Group from a level's menu, and survives a reload from the link", async () => {
    await renderCalendarRoute(TABLE);

    const group = await findStrip("calendar-group-strip");

    await within(group).findByRole("button", { name: "Month options" });
    await foldFrom(group, "Month options");
    await within(group).findByRole("button", { name: /2 Facets/u });

    expect(readLink()["fold"]).toBe("group");

    cleanup();
    await renderCalendarRoute(`${TABLE}&fold=group`);

    const reloaded = await findStrip("calendar-group-strip");

    await within(reloaded).findByRole("button", { name: /2 Facets/u });

    expect(within(reloaded).getAllByRole("button")).toHaveLength(2);
  });

  it("folds the Sort and Filter strips, and does not read the events again", async () => {
    await renderCalendarRoute(`${TABLE}&filter=${FILTER}`);

    const api = readServedApi();
    const sort = await findStrip("calendar-sort-strip");

    await within(sort).findByRole("button", { name: /Tags options/u });

    const loads = api.requests.windows.length;

    await foldFrom(sort, "Tags options");
    await within(sort).findByRole("button", { name: /1 Facet,/u });

    expect(readLink()["fold"]).toBe("sort");
    expect(api.requests.windows).toHaveLength(loads);

    const filters = await findStrip("calendar-filters");
    const chip = await within(filters).findByRole(
      "button",
      { name: /filter options/u },
      BUILDER_WAIT,
    );

    fireEvent.click(chip);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Fold" }));
    await waitFor(() => {
      expect(readLink()["fold"]).toBe("sort,filter");
    });

    expect(api.requests.windows).toHaveLength(loads);
  });

  it("folds the metrics' Select strip in the Charts and the Totals", async () => {
    await renderCalendarRoute(
      "/?view=charts&date=2026-03-04&metrics=events&metrics=duration",
    );

    const select = await findStrip("metric-select-strip");

    await within(select).findByRole("button", { name: /Events options/u });
    await foldFrom(select, "Events options");
    await within(select).findByRole("button", { name: /2 Facets/u });

    expect(readLink()["fold"]).toBe("select");
  });
});
