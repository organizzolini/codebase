import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TableHeaderCell } from "./table-header-cell";

import type { TableColumn } from "../../calendar-table.types";
import type { TableHeaderCellProperties } from "./table-header-cell";

const NAME: TableColumn = {
  icon: "text",
  id: "name",
  kind: "name",
  label: "Name",
};

function openMenu(): void {
  fireEvent.contextMenu(screen.getByTestId("table-header-pill"));
}

function renderCell(
  properties: Partial<TableHeaderCellProperties> = {},
  column: TableColumn = NAME,
): void {
  render(
    <table>
      <thead>
        <tr>
          <TableHeaderCell
            column={column}
            {...properties}
          />
        </tr>
      </thead>
    </table>,
  );
}

describe(TableHeaderCell, () => {
  it("renders the name as a pill led by its symbol", () => {
    renderCell();

    const pill = screen.getByTestId("table-header-pill");

    expect(pill.textContent).toBe("Name");
    expect(pill.className).toContain("bg-background");
    expect(pill.querySelector("[data-testid='tag-lead']")).not.toBeNull();
  });

  it("opens the menu on a right-click and runs its actions", async () => {
    const onClearSort = vi.fn();
    const onMoveLeft = vi.fn();
    const onMoveRight = vi.fn();
    const onRemove = vi.fn();
    const onSort = vi.fn();

    renderCell({ onClearSort, onMoveLeft, onMoveRight, onRemove, onSort });
    openMenu();
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Sort descending" }),
    );

    expect(onSort).toHaveBeenCalledExactlyOnceWith("desc");

    openMenu();
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Sort ascending" }),
    );

    expect(onSort).toHaveBeenLastCalledWith("asc");

    openMenu();
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Clear sort" }),
    );
    openMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));
    openMenu();
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Move right" }),
    );
    openMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onClearSort).toHaveBeenCalledExactlyOnceWith();
    expect(onMoveLeft).toHaveBeenCalledExactlyOnceWith();
    expect(onMoveRight).toHaveBeenCalledExactlyOnceWith();
    expect(onRemove).toHaveBeenCalledExactlyOnceWith();
  });

  it("disables what cannot apply and offers no clear sort", async () => {
    renderCell();
    openMenu();

    const left = await screen.findByRole("menuitem", { name: "Move left" });

    expect(left.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen
        .getByRole("menuitem", { name: "Move right" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      screen
        .getByRole("menuitem", { name: "Remove" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(screen.queryByRole("menuitem", { name: "Clear sort" })).toBeNull();
  });

  it("shows an arrow for the sort it leads", () => {
    renderCell({ sortDirection: "desc" });

    expect(
      screen.queryByRole("img", { name: "Sorted descending" }),
    ).not.toBeNull();
  });

  it("shows no arrow without a sort", () => {
    renderCell();

    expect(screen.queryByTestId("sort-indicator")).toBeNull();
  });

  it("keeps a position column a plain narrow pill", () => {
    renderCell({}, { icon: "hash", id: "number", kind: "number", label: "#" });
    openMenu();

    expect(screen.getByRole("columnheader").className).toContain("w-12");
    expect(screen.queryByRole("menuitem")).toBeNull();
  });
});
