import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { EMPTY_EVENT_FILTER } from "../calendar-filters/components/event-filter-model/event-filter-tree.constants";

import { CalendarViewStrip } from "./calendar-view-strip";
import { resolveViews } from "./calendar-view-strip.utilities";

import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { ViewSelection } from "./calendar-view-strip.types";

const FACETS = [
  {
    id: "lunar",
    name: "Lunar",
    values: [
      {
        count: 4,
        depth: 1,
        id: "monthly",
        name: "Monthly Cycle",
        path: "Monthly Cycle",
      },
    ],
  },
];

const [LUNAR] = resolveViews(FACETS);

function renderStrip(
  query: EventFilterQuery,
  selection?: Pick<ViewSelection, "group" | "sort">,
): { onSelect: ReturnType<typeof vi.fn<(next: ViewSelection) => void>> } {
  const onSelect = vi.fn<(next: ViewSelection) => void>();

  render(
    <CalendarViewStrip
      facets={FACETS}
      group={selection?.group}
      onSelect={onSelect}
      query={query}
      sort={selection?.sort}
    />,
  );

  return { onSelect };
}

describe(CalendarViewStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <CalendarViewStrip
        className="calendar-view-strip"
        facets={FACETS}
        group={undefined}
        onSelect={() => {}}
        query={EMPTY_EVENT_FILTER}
        sort={undefined}
      />,
    );

    expect(screen.getByTestId("calendar-view-strip").className).toBe(
      "calendar-view-strip",
    );
  });

  it("names the view the filter, group and sort match", () => {
    renderStrip(LUNAR?.filter ?? EMPTY_EVENT_FILTER, {
      group: LUNAR?.group,
      sort: LUNAR?.sort,
    });

    expect(screen.getByRole("group", { name: "Saved view" }).textContent).toBe(
      "ViewLunar Phases",
    );
  });

  it("names All Events when nothing is filtered, grouped or sorted", () => {
    renderStrip(EMPTY_EVENT_FILTER);

    expect(screen.getByRole("group", { name: "Saved view" }).textContent).toBe(
      "ViewAll Events",
    );
  });

  it("names a change away from a view Custom", () => {
    renderStrip(LUNAR?.filter ?? EMPTY_EVENT_FILTER);

    expect(screen.getByRole("group", { name: "Saved view" }).textContent).toBe(
      "ViewCustom",
    );
  });

  it("applies the filter, group and sort of the view picked", async () => {
    const { onSelect } = renderStrip(EMPTY_EVENT_FILTER);

    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(
      await screen.findByRole("treeitem", { name: /Lunar Phases/u }),
    );

    expect(onSelect).toHaveBeenCalledWith({
      filter: LUNAR?.filter,
      group: LUNAR?.group,
      sort: LUNAR?.sort,
    });
  });

  it("clears all three when All Events is picked", async () => {
    const { onSelect } = renderStrip(LUNAR?.filter ?? EMPTY_EVENT_FILTER, {
      group: LUNAR?.group,
      sort: LUNAR?.sort,
    });

    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(
      await screen.findByRole("treeitem", { name: /All Events/u }),
    );

    expect(onSelect).toHaveBeenCalledWith({
      filter: EMPTY_EVENT_FILTER,
      group: undefined,
      sort: undefined,
    });
  });

  it("opens its list from the chip as well as the button", async () => {
    renderStrip(EMPTY_EVENT_FILTER);
    fireEvent.click(screen.getByRole("button", { name: "All Events" }));

    await expect(screen.findByTestId("query-cascader")).resolves.toBeDefined();
  });
});
