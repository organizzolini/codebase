import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarSymbolsContext } from "../../../../calendar-events/event-glyphs/calendar-symbols.constants";

import { TableNameCell } from "./table-name-cell";

import type { CalendarEventRecord } from "../../../events-calendar/components/calendar-loader/calendar-records.types";

const AT = new Date("2026-03-04T15:20:00.000Z");
const SYMBOLIC: CalendarEventRecord = {
  color: null,
  durationMinutes: 0,
  end: AT,
  groups: [],
  id: "event-mars-conjunct-venus",
  name: "♂️☌♀️ Mars Conjunct Venus",
  note: "Mars Conjunct Venus",
  start: AT,
  tags: [],
  timezone: "UTC",
};

describe(TableNameCell, () => {
  it("applies its class name", () => {
    render(
      <TableNameCell
        className="table-name-cell"
        record={SYMBOLIC}
      />,
    );

    expect(screen.getByTestId("table-name-cell").className).toContain(
      "table-name-cell",
    );
    expect(screen.getByTestId("table-name-cell").className).toContain(
      "bg-background",
    );
  });

  it("draws the symbols as icons when the setting is glyphs", () => {
    render(
      <CalendarSymbolsContext value="glyphs">
        <TableNameCell record={SYMBOLIC} />
      </CalendarSymbolsContext>,
    );

    expect(screen.getByTestId("event-glyphs")).toBeDefined();
    expect(screen.getByText("Mars Conjunct Venus")).toBeDefined();
  });

  it("writes the symbols as emojis when the setting is emojis", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <TableNameCell record={SYMBOLIC} />
      </CalendarSymbolsContext>,
    );

    expect(screen.queryByTestId("event-glyphs")).toBeNull();
    expect(screen.getByTestId("table-name-cell").textContent).toContain(
      "♂️☌♀️",
    );
  });

  it("tints the pill in the event's color, with no dot or border", () => {
    render(<TableNameCell record={{ ...SYMBOLIC, color: "#b91c1c" }} />);

    const cell = screen.getByTestId("table-name-cell");

    expect(cell.getAttribute("style")).not.toBeNull();
    expect(cell.style.borderLeftColor).toBe("");
    expect(screen.queryByTestId("table-name-dot")).toBeNull();
  });

  it("keeps the default look for an event with no color", () => {
    render(<TableNameCell record={SYMBOLIC} />);

    expect(
      screen.getByTestId("table-name-cell").getAttribute("style"),
    ).toBeNull();
  });

  it("shows only the name when the event has no symbols", () => {
    render(<TableNameCell record={{ ...SYMBOLIC, name: "Plain", note: "" }} />);

    expect(screen.queryByTestId("event-glyphs")).toBeNull();
    expect(screen.getByTestId("table-name-cell").textContent).toBe("Plain");
  });
});
