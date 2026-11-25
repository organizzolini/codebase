import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TableBodyRows } from "./table-body-rows";

import type { TableColumn, TableRowModel } from "../../calendar-table.types";

const AT = new Date("2026-03-04T10:00:00.000Z");
const COLUMNS: TableColumn[] = [
  { id: "name", kind: "name", label: "Name" },
  { id: "start", kind: "start", label: "Start" },
];
const ROWS: TableRowModel[] = [
  {
    depth: 0,
    id: "event-id",
    kind: "event",
    position: 1,
    record: {
      color: null,
      description: "",
      durationMinutes: 0,
      end: AT,
      groups: [],
      id: "event-id",
      location: null,
      start: AT,
      summary: "Mars Conjunct Venus",
      tags: [],
      timezone: "UTC",
    },
  },
  {
    depth: 0,
    groupId: "group-id",
    id: "group-id|more",
    kind: "more",
    next: 7,
    remaining: 7,
    shown: 25,
    total: 32,
  },
];

describe(TableBodyRows, () => {
  it("draws a row of the kind each is", () => {
    render(
      <table>
        <TableBodyRows
          columns={COLUMNS}
          rows={ROWS}
          timeZone="UTC"
        />
      </table>,
    );

    expect(screen.getAllByTestId("table-event-row")).toHaveLength(1);
    expect(screen.getAllByTestId("table-more-row")).toHaveLength(1);
  });

  it("hands a press of more on to its handler", () => {
    const more = vi.fn<(listId: string, shown: number) => void>();

    render(
      <table>
        <TableBodyRows
          columns={COLUMNS}
          more={more}
          rows={ROWS}
          timeZone="UTC"
        />
      </table>,
    );
    fireEvent.click(screen.getByRole("button"));

    expect(more).toHaveBeenCalledWith("group-id", 25);
  });
});
