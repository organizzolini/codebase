import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarSortStrip } from "./calendar-sort-strip";

import type { GroupSort } from "../calendar-group-by/components/event-group-tree/event-group-tree.types";

const NO_SORT = undefined satisfies GroupSort | undefined;

function renderStrip(
  sort: GroupSort | undefined,
  view: "timeline" | "week" = "timeline",
): {
  onSortChange: ReturnType<typeof vi.fn<(sort: GroupSort | undefined) => void>>;
} {
  const onSortChange = vi.fn<(sort: GroupSort | undefined) => void>();

  render(
    <CalendarSortStrip
      onSortChange={onSortChange}
      sort={sort}
      view={view}
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

  it("draws nothing outside the timeline, which orders by time", () => {
    renderStrip(undefined, "week");

    expect(screen.queryByTestId("calendar-sort-strip")).toBeNull();
  });

  it("shows only the Sort button while nothing is sorted", () => {
    renderStrip(NO_SORT);

    expect(screen.getByRole("group", { name: "Sort" }).textContent).toBe(
      "Sort",
    );
  });

  it("names the sort on a chip that reverses it", () => {
    const { onSortChange } = renderStrip({ direction: "asc", key: "count" });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sorted by Event count, ascending; reverse",
      }),
    );

    expect(onSortChange).toHaveBeenCalledWith({
      direction: "desc",
      key: "count",
    });
  });

  it("sorts by the direction picked beneath a key", async () => {
    const { onSortChange } = renderStrip(NO_SORT);

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByText("Name"));
    fireEvent.click(await screen.findByText("Descending"));

    expect(onSortChange).toHaveBeenCalledWith({
      direction: "desc",
      key: "name",
    });
  });

  it("clears the sort with the default order", async () => {
    const { onSortChange } = renderStrip({ direction: "desc", key: "name" });

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByText("Default order"));

    expect(onSortChange).toHaveBeenCalledWith(undefined);
  });
});
