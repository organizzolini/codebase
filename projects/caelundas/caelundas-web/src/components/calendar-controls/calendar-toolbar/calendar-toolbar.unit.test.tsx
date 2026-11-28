import { fireEvent, render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";

import { OpenDatePickerContext } from "../calendar-date-picker/calendar-date-picker.constants";
import { CalendarNavigationSlot } from "../calendar-navigation-group/calendar-navigation-slot.constants";

import { CalendarToolbar } from "./calendar-toolbar";

import type { ReactNode } from "react";

const NAVIGATION = {
  next: () => {},
  prev: () => {},
  title: "March 2026",
  today: () => {},
};

/**
 * Filters that draw the date the toolbar hands them, as the Filter strip does.
 */
function FiltersWithDate(): ReactNode {
  return (
    <>
      <button type="button">Filter</button>
      {useContext(CalendarNavigationSlot)}
    </>
  );
}

/**
 * Whether the second element comes after the first in the document.
 */
function follows(first: Element, second: Element): boolean {
  return (
    (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) >
    0
  );
}

/**
 * A control, as the Filter list's Date item is, that asks the toolbar to open the picker.
 */
function OpenPickerButton(): ReactNode {
  const open = useContext(OpenDatePickerContext);

  return (
    <>
      <button
        onClick={open ?? undefined}
        type="button"
      >
        Open dates
      </button>
      {useContext(CalendarNavigationSlot)}
    </>
  );
}

describe(CalendarToolbar, () => {
  it("applies its class name", () => {
    render(
      <CalendarToolbar
        className="calendar-toolbar"
        navigation={NAVIGATION}
      />,
    );

    expect(screen.getByTestId("calendar-toolbar").className).toBe(
      "calendar-toolbar",
    );
  });

  it("titles the period it is handed", () => {
    render(<CalendarToolbar navigation={NAVIGATION} />);

    expect(screen.getByRole("heading", { name: "March 2026" })).toBeDefined();
  });

  it("gives a phone's controls a row of their own under the title", () => {
    render(
      <CalendarToolbar
        filters={<button type="button">Filters</button>}
        navigation={NAVIGATION}
        compact
      />,
    );

    const controls = screen.getByTestId("calendar-toolbar-controls");

    expect(
      controls.contains(screen.getByRole("button", { name: "Filters" })),
    ).toBe(true);
    expect(
      controls.contains(screen.getByRole("heading", { name: "March 2026" })),
    ).toBe(false);
  });

  it("draws the filters on one line, with the date among them", () => {
    render(
      <CalendarToolbar
        filters={<FiltersWithDate />}
        navigation={NAVIGATION}
      />,
    );

    const row = screen.getByTestId("calendar-toolbar-row");
    const filter = screen.getByRole("button", { name: "Filter" });
    const navigate = screen.getByRole("group", { name: "Navigate" });

    expect(row.contains(filter)).toBe(true);
    expect(row.contains(navigate)).toBe(true);
    expect(follows(filter, navigate)).toBe(true);
  });

  it("draws the date itself when there are no filters to carry it", () => {
    render(<CalendarToolbar navigation={NAVIGATION} />);

    expect(
      screen
        .getByTestId("calendar-toolbar-row")
        .contains(screen.getByRole("group", { name: "Navigate" })),
    ).toBe(true);
  });

  it("leaves a phone with no controls a single row", () => {
    render(
      <CalendarToolbar
        navigation={NAVIGATION}
        compact
      />,
    );

    expect(screen.queryByTestId("calendar-toolbar-controls")).toBeNull();
  });

  it("puts the title in the group with the arrows and Today", () => {
    render(<CalendarToolbar navigation={NAVIGATION} />);

    const group = screen.getByRole("group", { name: "Navigate" });

    for (const name of ["Previous", "Next", "Today"]) {
      expect(group.contains(screen.getByRole("button", { name }))).toBe(true);
    }

    expect(
      group.contains(screen.getByRole("heading", { name: "March 2026" })),
    ).toBe(true);
  });

  it("hides Today when the days shown include today", () => {
    const { rerender } = render(
      <CalendarToolbar navigation={{ ...NAVIGATION, isToday: true }} />,
    );

    expect(screen.queryByRole("button", { name: "Today" })).toBeNull();

    rerender(
      <CalendarToolbar navigation={{ ...NAVIGATION, isToday: false }} />,
    );

    expect(screen.getByRole("button", { name: "Today" }).textContent).toBe(
      "Today",
    );
  });

  it("holds the date's width however long the period's name runs", () => {
    const { rerender } = render(<CalendarToolbar navigation={NAVIGATION} />);
    const first = screen.getByRole("heading").className;

    rerender(
      <CalendarToolbar
        navigation={{ ...NAVIGATION, title: "Thursday, October 22, 2026" }}
      />,
    );

    expect(screen.getByRole("heading").className).toBe(first);
  });

  it("opens the date picker when a control inside it asks", () => {
    render(
      <CalendarToolbar
        datePicker={{
          onApply: () => {},
          range: { from: "2026-03-01", to: "2026-03-31" },
          timeZone: "UTC",
        }}
        filters={<OpenPickerButton />}
        navigation={NAVIGATION}
      />,
    );

    expect(screen.queryByTestId("date-picker-panel")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open dates" }));

    expect(screen.getByTestId("date-picker-panel")).toBeDefined();
  });

  it("offers no way to open a picker it was not given", () => {
    render(
      <CalendarToolbar
        filters={<OpenPickerButton />}
        navigation={NAVIGATION}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open dates" }));

    expect(screen.queryByTestId("date-picker-panel")).toBeNull();
  });
});
