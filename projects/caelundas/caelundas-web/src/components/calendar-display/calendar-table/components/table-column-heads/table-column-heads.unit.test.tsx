import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TableColumnHeads } from "./table-column-heads";

import type { TableColumn } from "../../calendar-table.types";

const COLUMNS: TableColumn[] = [
  { icon: "hash", id: "number", kind: "number", label: "#" },
  { icon: "text", id: "name", kind: "name", label: "Name" },
  { id: "tag", kind: "tag", label: "Venus", prefix: "Venus" },
];

function renderHeads(className?: string): void {
  render(
    <table>
      <thead>
        <TableColumnHeads
          columns={COLUMNS}
          {...(className === undefined ? {} : { className })}
        />
      </thead>
    </table>,
  );
}

describe(TableColumnHeads, () => {
  it("applies its class name", () => {
    renderHeads("table-column-heads");

    expect(screen.getByTestId("table-column-heads").className).toContain(
      "table-column-heads",
    );
  });

  it("names each column, leading each name with a symbol", () => {
    renderHeads();

    const heads = screen.getAllByRole("columnheader");

    expect(heads.map((head) => head.textContent)).toStrictEqual([
      "#",
      "Name",
      "Venus",
    ]);
    expect(
      heads.every((head) => head.querySelector("[data-testid='tag-lead']")),
    ).toBe(true);
  });

  it("prefers a name's glyph to its icon, in the header too", () => {
    renderHeads();

    const venus = screen.getAllByRole("columnheader")[2];

    expect(venus?.querySelector("[data-testid='event-glyphs']")).not.toBeNull();
  });

  it("keeps the number column narrow", () => {
    renderHeads();

    expect(screen.getAllByRole("columnheader")[0]?.className).toContain("w-12");
  });
});
