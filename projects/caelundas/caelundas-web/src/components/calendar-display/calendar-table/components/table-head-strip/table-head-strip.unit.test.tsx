import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TableHeadStrip } from "./table-head-strip";

import type { TableColumn } from "../../calendar-table.types";

const COLUMNS: TableColumn[] = [
  { icon: "hash", id: "number", kind: "number", label: "#" },
  { icon: "text", id: "name", kind: "name", label: "Name" },
];

describe(TableHeadStrip, () => {
  it("heads each column and is at least as wide as they are together", () => {
    render(<TableHeadStrip columns={COLUMNS} />);

    expect(
      screen.getAllByRole("columnheader").map((head) => head.textContent),
    ).toStrictEqual(["#", "Name"]);
    expect(screen.getByRole("table").style.width).toBe("max(100%, 24rem)");
  });

  it("clips and applies its class name", () => {
    render(
      <TableHeadStrip
        className="strip"
        columns={COLUMNS}
      />,
    );

    const strip = screen.getByTestId("table-head-strip");

    expect(strip.className).toContain("overflow-hidden");
    expect(strip.className).toContain("strip");
  });
});
