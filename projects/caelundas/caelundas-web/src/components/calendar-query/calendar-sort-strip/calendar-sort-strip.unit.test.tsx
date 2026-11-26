import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { renderWithCatalog } from "../../../../testing/metrics/metric-catalog";

import { CalendarSortStrip } from "./calendar-sort-strip";

import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { StripFold } from "../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
    ],
  },
];
const NO_SORT = undefined satisfies readonly GroupSort[] | undefined;
const NAME_ASC: GroupSort = { direction: "asc", key: "name" };
const COUNT_DESC: GroupSort = { direction: "desc", key: "count" };

function renderStrip(
  sort: readonly GroupSort[] | undefined,
  options: Readonly<{
    metrics?: readonly string[];
    view?: "charts" | "timeline" | "totals" | "week";
  }> = {},
): {
  onSortChange: ReturnType<
    typeof vi.fn<(sort: GroupSort[] | undefined) => void>
  >;
} {
  const onSortChange = vi.fn<(sort: GroupSort[] | undefined) => void>();

  renderWithCatalog(
    <CalendarSortStrip
      facets={FACETS}
      metrics={options.metrics}
      onSortChange={onSortChange}
      sort={sort}
      view={options.view ?? "timeline"}
    />,
  );

  return { onSortChange };
}

describe(CalendarSortStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <CalendarSortStrip
        className="calendar-sort-strip"
        onSortChange={() => {}}
        sort={undefined}
        view="timeline"
      />,
    );

    expect(screen.getByTestId("calendar-sort-strip").className).toBe(
      "calendar-sort-strip",
    );
  });

  it("flags each of its buttons as an item of one wrapping strip", () => {
    renderStrip(NO_SORT);

    const strip = screen.getByRole("group", { name: "Sort" });

    expect(Object.hasOwn(strip.dataset, "stripButtons")).toBe(true);
    expect(strip.className).toContain("flex-wrap");
    expect(strip.className).toContain("[&>[data-line-start]]:border-l!");
  });

  it("draws nothing outside the timeline, which orders by time", () => {
    renderStrip(NO_SORT, { view: "week" });

    expect(screen.queryByTestId("calendar-sort-strip")).toBeNull();
  });

  it("shows a default Tags chip while nothing is sorted", () => {
    renderStrip(NO_SORT);

    expect(
      screen.getByRole("button", {
        name: "Sorted by Tags, ascending; reverse",
      }),
    ).toBeDefined();
  });

  it("offers the default chip every menu action but removing it", async () => {
    renderStrip(NO_SORT);

    fireEvent.click(screen.getByRole("button", { name: "Tags options" }));

    const remove = await screen.findByRole("menuitem", { name: "Remove" });

    expect(remove.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("menuitem", { name: "Reverse" })).toBeDefined();
  });

  it("reverses a sort from its ellipsis menu", async () => {
    const { onSortChange } = renderStrip([NAME_ASC]);

    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Reverse" }));

    expect(onSortChange).toHaveBeenCalledWith([
      { direction: "desc", key: "name" },
    ]);
  });

  it("names a tag sort after its root and tag", () => {
    renderStrip([{ direction: "asc", key: "tag", tag: "tag:type" }]);

    expect(
      screen.getByRole("button", {
        name: "Sorted by Type, ascending; reverse",
      }),
    ).toBeDefined();
  });

  it("sorts the default chip's groups the other way when it is pressed", () => {
    const { onSortChange } = renderStrip(NO_SORT);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sorted by Tags, ascending; reverse",
      }),
    );

    expect(onSortChange).toHaveBeenCalledWith([
      { direction: "desc", key: "order" },
    ]);
  });

  it("names each sort on a chip that reverses it", () => {
    const { onSortChange } = renderStrip([COUNT_DESC]);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sorted by Event count, descending; reverse",
      }),
    );

    expect(onSortChange).toHaveBeenCalledWith([
      { direction: "asc", key: "count" },
    ]);
  });

  it("adds a sort from the list", async () => {
    const { onSortChange } = renderStrip([NAME_ASC]);

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByText("Event count"));

    expect(onSortChange).toHaveBeenCalledWith([
      NAME_ASC,
      { direction: "asc", key: "count" },
    ]);
  });

  it("moves a sort right, and left, from its ellipsis menu", async () => {
    const { onSortChange } = renderStrip([NAME_ASC, COUNT_DESC]);

    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Move right" }),
    );

    expect(onSortChange).toHaveBeenLastCalledWith([COUNT_DESC, NAME_ASC]);

    fireEvent.click(
      screen.getByRole("button", { name: "Event count options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));

    expect(onSortChange).toHaveBeenLastCalledWith([COUNT_DESC, NAME_ASC]);
  });

  it("removes a sort from its ellipsis menu, and clears the last one", async () => {
    const { onSortChange } = renderStrip([NAME_ASC, COUNT_DESC]);

    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onSortChange).toHaveBeenLastCalledWith([COUNT_DESC]);
  });

  it("clears the sorts when the only one is removed", async () => {
    const { onSortChange } = renderStrip([NAME_ASC]);

    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onSortChange.mock.lastCall).toStrictEqual([undefined]);
  });

  it("draws in the Charts and Totals, defaulting to the Tags chip", () => {
    for (const view of ["charts", "totals"] as const) {
      const { unmount } = renderWithCatalog(
        <CalendarSortStrip
          onSortChange={() => {}}
          sort={undefined}
          view={view}
        />,
      );

      expect(
        screen.getByRole("button", {
          name: "Sorted by Tags, ascending; reverse",
        }),
      ).toBeDefined();

      unmount();
    }
  });

  it("in the Charts offers the tag order, the name and each metric measured", async () => {
    renderStrip(NO_SORT, {
      metrics: ["events", "progressive-events"],
      view: "charts",
    });
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));

    await expect(
      screen.findByText("Progressive events"),
    ).resolves.toBeDefined();
    expect(screen.getAllByText("Tags").length).toBeGreaterThan(0);
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Events")).toBeDefined();
    expect(screen.queryByText("Event count")).toBeNull();
    expect(screen.queryByText("Unique names")).toBeNull();
  });

  it("in the Totals offers the layout's metrics when it is given none", async () => {
    renderStrip(NO_SORT, { view: "totals" });
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));

    await expect(screen.findByText("Average duration")).resolves.toBeDefined();
  });

  it("sorts by a metric picked from the list, after the sorts already on", async () => {
    const { onSortChange } = renderStrip([NAME_ASC], {
      metrics: ["events", "progressive-events"],
      view: "charts",
    });

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByText("Progressive events"));

    expect(onSortChange).toHaveBeenCalledWith([
      NAME_ASC,
      { direction: "asc", key: "metric", metric: "progressive-events" },
    ]);
  });

  it("names a metric sort after the metric, and reverses it", () => {
    const { onSortChange } = renderStrip(
      [{ direction: "desc", key: "metric", metric: "progressive-events" }],
      { metrics: ["progressive-events"], view: "charts" },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sorted by Progressive events, descending; reverse",
      }),
    );

    expect(onSortChange).toHaveBeenCalledWith([
      { direction: "asc", key: "metric", metric: "progressive-events" },
    ]);
  });

  it("in the table offers only the sorts of the selected columns, and keeps one already on", async () => {
    const onSortChange = vi.fn<(sort: GroupSort[] | undefined) => void>();

    renderWithCatalog(
      <CalendarSortStrip
        columns={["name"]}
        facets={FACETS}
        onSortChange={onSortChange}
        sort={[{ direction: "asc", key: "tag", tag: "tag:type" }]}
        view="table"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));

    await expect(screen.findByText("Event count")).resolves.toBeDefined();
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.queryByText("First event")).toBeNull();

    fireEvent.click(screen.getByText("Event count"));

    expect(onSortChange).toHaveBeenCalledWith([
      { direction: "asc", key: "tag", tag: "tag:type" },
      { direction: "asc", key: "count" },
    ]);
  });

  it("keeps only a sort from its ellipsis menu", async () => {
    const { onSortChange } = renderStrip([NAME_ASC, COUNT_DESC]);

    fireEvent.click(
      screen.getByRole("button", { name: "Event count options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Only" }));

    expect(onSortChange).toHaveBeenLastCalledWith([COUNT_DESC]);
  });

  describe("folding", () => {
    const TWO = [NAME_ASC, COUNT_DESC];

    function renderFolded(
      isFolded: boolean,
      sort?: readonly GroupSort[],
    ): StripFold {
      const fold: StripFold = {
        isFolded,
        onFold: vi.fn<() => void>(),
        onUnfold: vi.fn<() => void>(),
      };

      renderWithCatalog(
        <CalendarSortStrip
          facets={FACETS}
          fold={fold}
          onSortChange={() => {}}
          sort={sort}
          view="timeline"
        />,
      );

      return fold;
    }

    it("shows the Sort button and a count of its chips, and unfolds when it is pressed", () => {
      const fold = renderFolded(true, TWO);
      const strip = screen.getByRole("group", { name: "Sort" });

      expect(strip.querySelectorAll("button")).toHaveLength(2);
      expect(screen.queryByRole("button", { name: "Name options" })).toBeNull();

      const count = screen.getByRole("button", { name: /2 Facets/u });

      expect(count.title).toBe("Name, Event count");

      fireEvent.click(count);

      expect(fold.onUnfold).toHaveBeenCalledTimes(1);
    });

    it("counts the default Tags sort as one facet", () => {
      renderFolded(true);

      expect(screen.getByRole("button", { name: /1 Facet,/u }).title).toBe(
        "Tags",
      );
    });

    it("folds from a chip's menu while it is unfolded", async () => {
      const fold = renderFolded(false, TWO);

      fireEvent.click(screen.getByRole("button", { name: "Name options" }));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Fold" }));

      expect(fold.onFold).toHaveBeenCalledTimes(1);
    });
  });
});
