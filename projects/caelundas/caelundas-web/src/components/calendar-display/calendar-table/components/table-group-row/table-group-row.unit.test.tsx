import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TableGroupRow } from "./table-group-row";

import type { CalendarEventRecord } from "../../../events-calendar/components/calendar-loader/calendar-records.types";
import type { TableColumn, TableRowModel } from "../../calendar-table.types";

type GroupRow = Extract<TableRowModel, { kind: "group" }>;

function event(id: string, start: string, tags: string[]): CalendarEventRecord {
  const at = new Date(start);

  return {
    color: null,
    description: "",
    durationMinutes: 0,
    end: at,
    groups: [],
    id,
    location: null,
    start: at,
    summary: `Event ${id}`,
    tags: tags.map((name) => ({
      depth: 1,
      id: name,
      name,
      path: `Body / ${name}`,
    })),
    timezone: "UTC",
  };
}

const EVENTS = [
  event("a", "2026-03-04T10:00:00.000Z", ["Sun", "Mars"]),
  event("b", "2026-03-04T10:00:00.000Z", ["Sun"]),
  event("c", "2026-03-05T10:00:00.000Z", ["Sun"]),
];
const COLUMNS: TableColumn[] = [
  { id: "group", kind: "group", label: "Group" },
  { id: "name", kind: "name", label: "Name" },
  { id: "start", kind: "start", label: "Start" },
  { id: "tag", kind: "tag", label: "Body", prefix: "Body" },
  { id: "empty", kind: "tag", label: "Zodiac", prefix: "Zodiac" },
];
const ROW: GroupRow = {
  depth: 2,
  expanded: true,
  id: "group-id",
  kind: "group",
  node: {
    children: [],
    count: 3,
    events: EVENTS,
    id: "group-id",
    key: "aspect",
    label: "Aspect",
    level: 1,
    path: ["Aspect"],
  },
};

function renderRow(
  row: GroupRow,
  className?: string,
  nodeColors?: ReadonlyMap<string, string>,
): ReturnType<typeof vi.fn<(id: string) => void>> {
  const onToggle = vi.fn<(id: string) => void>();

  render(
    <table>
      <tbody>
        <TableGroupRow
          columns={COLUMNS}
          nodeColors={nodeColors}
          onToggle={onToggle}
          row={row}
          timeZone="UTC"
          {...(className === undefined ? {} : { className })}
        />
      </tbody>
    </table>,
  );

  return onToggle;
}

describe(TableGroupRow, () => {
  it("tints its pill with the color of its tag", () => {
    renderRow(ROW, undefined, new Map([["group-id", "rgb(255, 0, 0)"]]));

    const { background } = screen.getByRole("button", {
      name: "Aspect",
    }).style;

    expect(background).toContain("color-mix");
    expect(background).toContain("rgb(255, 0, 0)");
  });

  it("leaves its pill plain with colors off or no color for its tag", () => {
    renderRow(ROW);

    expect(
      screen.getByRole("button", { name: "Aspect" }).style.background,
    ).toBe("");
  });

  it("leaves its pill plain when the legend lacks its tag", () => {
    renderRow(ROW, undefined, new Map([["other", "red"]]));

    expect(
      screen.getByRole("button", { name: "Aspect" }).style.background,
    ).toBe("");
  });

  it("applies its class name", () => {
    renderRow(ROW, "table-group-row");

    expect(screen.getByTestId("table-group-row").className).toContain(
      "table-group-row",
    );
  });

  it("sticks beneath the headers it is nested in, frosted rather than opaque", () => {
    renderRow(ROW);

    const row = screen.getByTestId("table-group-row");

    expect(row.className).toContain("sticky");
    expect(row.className).toContain("hover:bg-transparent");
    expect(row.className).toContain("has-aria-expanded:bg-transparent");
    expect(row.className).not.toMatch(/(^| )bg-(muted|background)( |$)/u);
    expect(row.style.height).toBe("2.25rem");
    expect(screen.getAllByRole("cell")[0]?.className).not.toMatch(
      /backdrop|bg-/u,
    );
    expect(row.style.top).toBe("4.5rem");
    expect(row.dataset["depth"]).toBe(String(ROW.depth));
  });

  it("has a cell for each column", () => {
    renderRow(ROW);

    expect(screen.getAllByRole("cell")).toHaveLength(5);
  });

  it("puts the group's label in one opaque pill in the group column, which is the button", () => {
    renderRow(ROW);

    const button = screen.getByRole("button", { name: "Aspect" });

    expect(button.className).toContain("bg-background");
    expect(button.className).toContain("rounded-md");
    expect(screen.getAllByRole("cell")[0]?.contains(button)).toBe(true);
  });

  it("says how many distinct events the group has in the name column", () => {
    renderRow(ROW);

    expect(screen.getAllByRole("cell")[1]?.textContent).toBe("3 distinct");
  });

  it("says how many distinct values the group's events have in each other column, and nothing for none", () => {
    renderRow(ROW);

    const cells = screen.getAllByRole("cell");

    expect(cells[2]?.textContent).toBe("2 distinct");
    expect(cells[3]?.textContent).toBe("2 distinct");
    expect(cells[4]?.textContent).toBe("");
  });

  it("indents the button by its depth", () => {
    renderRow(ROW);

    expect(screen.getByRole("button").style.marginLeft).toBe("2.5rem");
  });

  it("opens or closes the group by its id", () => {
    const onToggle = renderRow(ROW);

    fireEvent.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledWith("group-id");
  });

  it("says it is closed when its events are hidden", () => {
    renderRow({ ...ROW, expanded: false });

    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
      "false",
    );
  });
});
