import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarToolbar } from "./calendar-toolbar";

const NAVIGATION = {
  next: () => {},
  prev: () => {},
  title: "March 2026",
  today: () => {},
};

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

  it("gives a phone's menus and filters the row under the title", () => {
    render(
      <CalendarToolbar
        filters={<button type="button">Filters</button>}
        menus={<button type="button">View</button>}
        navigation={NAVIGATION}
        compact
      />,
    );

    const controls = screen.getByTestId("calendar-toolbar-controls");

    for (const name of ["View", "Filters"]) {
      expect(controls.contains(screen.getByRole("button", { name }))).toBe(
        true,
      );
    }
  });

  it("splits a wide toolbar into menus with the date, then filters with the views", () => {
    render(
      <CalendarToolbar
        filters={<button type="button">Filters</button>}
        menus={<button type="button">View</button>}
        navigation={NAVIGATION}
        onViewChange={() => {}}
        view="month"
      />,
    );

    const menus = screen.getByTestId("calendar-toolbar-menus");
    const filters = screen.getByTestId("calendar-toolbar-filters");

    expect(menus.contains(screen.getByRole("button", { name: "View" }))).toBe(
      true,
    );
    expect(
      menus.contains(screen.getByRole("heading", { name: "March 2026" })),
    ).toBe(true);
    expect(
      filters.contains(screen.getByRole("button", { name: "Filters" })),
    ).toBe(true);
    expect(
      filters.contains(screen.getByRole("button", { name: "Month" })),
    ).toBe(true);
    expect(screen.queryByTestId("calendar-toolbar-controls")).toBeNull();
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

  it("switches Today off when the days shown include today", () => {
    const { rerender } = render(
      <CalendarToolbar navigation={{ ...NAVIGATION, isToday: true }} />,
    );

    expect(screen.getByRole("button", { name: "Today" })).toHaveProperty(
      "disabled",
      true,
    );

    rerender(
      <CalendarToolbar navigation={{ ...NAVIGATION, isToday: false }} />,
    );

    expect(screen.getByRole("button", { name: "Today" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("draws the date above the filters, and the views after the filters", () => {
    render(
      <CalendarToolbar
        filters={<button type="button">Filter</button>}
        navigation={NAVIGATION}
        onViewChange={() => {}}
        view="month"
      />,
    );

    const filter = screen.getByRole("button", { name: "Filter" });
    const views = screen.getByRole("group", { name: "View" });
    const navigate = screen.getByRole("group", { name: "Navigate" });

    expect(
      navigate.compareDocumentPosition(filter) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeGreaterThan(0);
    expect(
      filter.compareDocumentPosition(views) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeGreaterThan(0);
    expect(views.contains(filter)).toBe(false);
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
});
