import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TableSizer } from "./table-sizer";

import type { TableColumn } from "../../calendar-table.types";

const COLUMNS: TableColumn[] = [
  { icon: "hash", id: "number", kind: "number", label: "#" },
  { icon: "text", id: "name", kind: "name", label: "Name" },
];

describe(TableSizer, () => {
  it("sizes a cell for each column and hides itself", () => {
    render(
      <table>
        <TableSizer columns={COLUMNS} />
      </table>,
    );

    const sizer = screen.getByTestId("table-sizer");
    const cells = [...sizer.querySelectorAll("th")];

    expect(sizer.getAttribute("aria-hidden")).toBe("true");
    expect(cells.map((cell) => cell.style.width)).toStrictEqual([
      "4rem",
      "20rem",
    ]);
  });

  it("applies its class name", () => {
    render(
      <table>
        <TableSizer
          className="sizer"
          columns={COLUMNS}
        />
      </table>,
    );

    expect(screen.getByTestId("table-sizer").className).toContain("sizer");
  });
});
