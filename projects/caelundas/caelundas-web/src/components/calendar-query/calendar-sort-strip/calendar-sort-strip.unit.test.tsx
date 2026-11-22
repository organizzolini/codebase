import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarSortStrip } from "./calendar-sort-strip";

import type { EventGroupLevel } from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";

const NO_SORT = undefined satisfies readonly GroupSort[] | undefined;
const NAME_ASC: GroupSort = { direction: "asc", key: "name" };
const COUNT_DESC: GroupSort = { direction: "desc", key: "count" };

function renderStrip(
  sort: readonly GroupSort[] | undefined,
  options: Readonly<{
    grouping?: readonly EventGroupLevel[];
    view?: "timeline" | "week";
  }> = {},
): {
  onSortChange: ReturnType<
    typeof vi.fn<(sort: GroupSort[] | undefined) => void>
  >;
} {
  const onSortChange = vi.fn<(sort: GroupSort[] | undefined) => void>();

  render(
    <CalendarSortStrip
      grouping={options.grouping ?? []}
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

  it("draws nothing outside the timeline, which orders by time", () => {
    renderStrip(NO_SORT, { view: "week" });

    expect(screen.queryByTestId("calendar-sort-strip")).toBeNull();
  });

  it("shows a default chip for the first group while nothing is sorted", () => {
    renderStrip(NO_SORT, { grouping: [{ field: "tag:type" }] });

    expect(
      screen.getByRole("button", {
        name: "Sorted by tag:type, ascending; reverse",
      }),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: /options$/u })).toBeNull();
  });

  it("sorts the default chip's groups the other way when it is pressed", () => {
    const { onSortChange } = renderStrip(NO_SORT);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sorted by Name, ascending; reverse",
      }),
    );

    expect(onSortChange).toHaveBeenCalledWith([
      { direction: "desc", key: "name" },
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
    fireEvent.click(await screen.findByText("Descending"));

    expect(onSortChange).toHaveBeenCalledWith([NAME_ASC, COUNT_DESC]);
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
});
