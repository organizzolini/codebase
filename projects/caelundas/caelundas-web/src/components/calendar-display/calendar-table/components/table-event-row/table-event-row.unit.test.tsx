import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TableEventRow } from "./table-event-row";

import type { TableColumn, TableRowModel } from "../../calendar-table.types";

const AT = new Date("2026-03-04T10:00:00.000Z");
const ROW: Extract<TableRowModel, { kind: "event" }> = {
  depth: 1,
  id: "event-id",
  kind: "event",
  position: 3,
  record: {
    color: null,
    durationMinutes: 0,
    end: AT,
    groups: [],
    id: "event-id",
    name: "Mars Conjunct Venus",
    note: "",
    start: AT,
    tags: [],
    timezone: "UTC",
  },
};
const COLUMNS: TableColumn[] = [
  { id: "name", kind: "name", label: "Name" },
  { id: "start", kind: "start", label: "Start" },
];

function renderRow(className?: string): void {
  render(
    <table>
      <tbody>
        <TableEventRow
          columns={COLUMNS}
          row={ROW}
          timeZone="UTC"
          {...(className === undefined ? {} : { className })}
        />
      </tbody>
    </table>,
  );
}

describe(TableEventRow, () => {
  it("applies its class name", () => {
    renderRow("table-event-row");

    expect(screen.getByTestId("table-event-row").className).toContain(
      "table-event-row",
    );
  });

  it("draws a cell for each column", () => {
    renderRow();

    expect(
      screen.getAllByRole("cell").map((cell) => cell.textContent),
    ).toStrictEqual(["Mars Conjunct Venus", "Mar 4, 2026, 10:00 AM"]);
  });

  it("sits a time in an opaque pill", () => {
    renderRow();

    const pill = screen.getByTestId("table-time-pill");

    expect(pill.className).toContain("bg-background");
    expect(pill.textContent).toBe("Mar 4, 2026, 10:00 AM");
  });

  it("indents only the first cell, beneath its groups", () => {
    renderRow();

    const [first, second] = screen.getAllByRole("cell");

    expect(first?.style.paddingLeft).toBe("1.75rem");
    expect(second?.style.paddingLeft).toBe("");
  });

  it("draws a tag column's tags as pills", () => {
    render(
      <table>
        <tbody>
          <TableEventRow
            columns={[
              { id: "tag:body", kind: "tag", label: "Body", prefix: "Body" },
            ]}
            row={{
              ...ROW,
              record: {
                ...ROW.record,
                tags: [
                  { depth: 1, id: "sun", name: "Sun", path: "Body / Sun" },
                ],
              },
            }}
            timeZone="UTC"
          />
        </tbody>
      </table>,
    );

    expect(screen.getByTestId("table-tag-pill").textContent).toBe("Sun");
  });

  it("says the event's place in its list in the leading group or number column", () => {
    render(
      <table>
        <tbody>
          <TableEventRow
            columns={[
              { id: "group", kind: "group", label: "Group" },
              { id: "name", kind: "name", label: "Name" },
            ]}
            row={{ ...ROW, position: 26 }}
            timeZone="UTC"
          />
        </tbody>
      </table>,
    );

    const pill = screen.getByTestId("table-position-pill");

    expect(pill.textContent).toBe("26");
    expect(pill.className).toContain("tabular-nums");
    expect(pill.className).toContain("bg-background");
  });
});
