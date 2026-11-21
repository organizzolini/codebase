import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarViewsMenu } from "./calendar-views-menu";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";

describe(CalendarViewsMenu, () => {
  it("applies its class name", () => {
    render(
      <CalendarViewsMenu
        className="calendar-views-menu"
        onViewChange={() => {}}
        view="month"
      />,
    );

    expect(screen.getByTestId("calendar-views-menu").className).toBe(
      "calendar-views-menu",
    );
  });

  it("names the view shown on a chip beside the Calendar button", () => {
    render(
      <CalendarViewsMenu
        onViewChange={() => {}}
        view="three-day"
      />,
    );

    expect(screen.getByRole("group", { name: "Calendar" }).textContent).toBe(
      "Calendar3 Days",
    );
  });

  it("lists every view and reports the one picked", async () => {
    const onViewChange = vi.fn<(view: CalendarViewName) => void>();

    render(
      <CalendarViewsMenu
        onViewChange={onViewChange}
        view="month"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Calendar" }));

    await expect(screen.findAllByRole("treeitem")).resolves.toHaveLength(6);

    fireEvent.click(await screen.findByText("Timeline"));

    expect(onViewChange).toHaveBeenCalledWith("timeline");
  });
});
