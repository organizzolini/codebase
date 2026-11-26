import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarSelectStrip } from "./calendar-select-strip";

import type { StripFold } from "../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      {
        count: 1,
        depth: 2,
        id: "major",
        name: "Major",
        path: "Aspect / Major",
      },
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

  it("keeps only a column from its ellipsis menu, and offers none for the last", async () => {
    const { onColumnsChange } = renderStrip(["name", "start"]);

    fireEvent.click(screen.getByRole("button", { name: "Start options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Only" }));

    expect(onColumnsChange).toHaveBeenCalledWith(["start"]);
  });

  it("names a deep tag column by its own name, its path as the tooltip", () => {
    renderStrip(["aspect"]);

    expect(screen.getByRole("button", { name: "Aspect" })).toBeDefined();
    expect(screen.getByTitle("Type › Aspect")).toBeDefined();
  });

  it("holds the tag roots under a Tag row open from the start", async () => {
    renderStrip(["name"]);
    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    await expect(screen.findByText("Tag")).resolves.toBeDefined();
    expect(screen.getByText("Type")).toBeDefined();
  });

  describe("folding", () => {
    function renderFolded(isFolded: boolean): StripFold {
      const fold: StripFold = {
        isFolded,
        onFold: vi.fn<() => void>(),
        onUnfold: vi.fn<() => void>(),
      };

      render(
        <CalendarSelectStrip
          columns={["name", "start"]}
          facets={FACETS}
          fold={fold}
          onColumnsChange={() => {}}
          view="table"
        />,
      );

      return fold;
    }

    it("shows the Select button and a count of its chips, and unfolds when it is pressed", () => {
      const fold = renderFolded(true);
      const strip = screen.getByRole("group", { name: "Select" });

      expect(strip.querySelectorAll("button")).toHaveLength(2);
      expect(
        screen.queryByRole("button", { name: "Start options" }),
      ).toBeNull();

      const count = screen.getByRole("button", { name: /2 Facets/u });

      expect(count.title).toBe("Name, Start");

      fireEvent.click(count);

      expect(fold.onUnfold).toHaveBeenCalledTimes(1);
    });

    it("folds from a chip's menu while it is unfolded", async () => {
      const fold = renderFolded(false);

      fireEvent.click(screen.getByRole("button", { name: "Start options" }));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Fold" }));

      expect(fold.onFold).toHaveBeenCalledTimes(1);
    });
  });
});
