import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarSelectStrip } from "./calendar-select-strip";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
    ],
  },
];

function renderStrip(
  columns: readonly string[] | undefined,
  view: "table" | "timeline" = "table",
): {
  onColumnsChange: ReturnType<
    typeof vi.fn<(columns: readonly string[] | undefined) => void>
  >;
} {
  const onColumnsChange =
    vi.fn<(columns: readonly string[] | undefined) => void>();

  render(
    <CalendarSelectStrip
      columns={columns}
      facets={FACETS}
      onColumnsChange={onColumnsChange}
      view={view}
    />,
  );

  return { onColumnsChange };
}

describe(CalendarSelectStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <CalendarSelectStrip
        className="calendar-select-strip"
        columns={undefined}
        onColumnsChange={() => {}}
        view="table"
      />,
    );

    expect(screen.getByTestId("calendar-select-strip").className).toBe(
      "calendar-select-strip",
    );
  });

  it("draws nothing outside the table, the only view with columns", () => {
    renderStrip(undefined, "timeline");

    expect(screen.queryByTestId("calendar-select-strip")).toBeNull();
  });

  it("draws nothing in the Charts and Totals, which list metrics instead", () => {
    for (const view of ["charts", "totals"] as const) {
      const { unmount } = render(
        <CalendarSelectStrip
          columns={undefined}
          onColumnsChange={() => {}}
          view={view}
        />,
      );

      expect(screen.queryByTestId("calendar-select-strip")).toBeNull();

      unmount();
    }
  });

  it("shows a chip for each default column while none are picked", () => {
    renderStrip([]);

    expect(screen.getByRole("button", { name: "Name" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Start" })).toBeDefined();
    expect(screen.getByRole("button", { name: "End" })).toBeDefined();
  });

  it("shows the picked columns in their order, tags included", () => {
    renderStrip(["tag:type", "name"]);

    expect(screen.getByRole("button", { name: "Type" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Name" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
  });

  it("removes a column from its ellipsis menu", async () => {
    const { onColumnsChange } = renderStrip(["name", "start"]);

    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onColumnsChange).toHaveBeenCalledWith(["start"]);
  });

  it("clears the columns when the last one is removed", async () => {
    const { onColumnsChange } = renderStrip(["name"]);

    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onColumnsChange.mock.lastCall).toStrictEqual([undefined]);
  });

  it("moves a column right, and left, from its ellipsis menu", async () => {
    const { onColumnsChange } = renderStrip(["name", "start"]);

    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Move right" }),
    );

    expect(onColumnsChange).toHaveBeenLastCalledWith(["start", "name"]);

    fireEvent.click(screen.getByRole("button", { name: "Start options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));

    expect(onColumnsChange).toHaveBeenLastCalledWith(["start", "name"]);
  });
});
