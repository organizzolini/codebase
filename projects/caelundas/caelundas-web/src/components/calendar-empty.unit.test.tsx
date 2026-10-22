import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarEmpty } from "./calendar-empty";

describe(CalendarEmpty, () => {
  it("applies its class name", () => {
    render(
      <CalendarEmpty
        className="calendar-empty"
        emptiness={{ kind: "match" }}
        onJump={() => {}}
      />,
    );

    expect(screen.getByTestId("calendar-empty").className).toBe(
      "calendar-empty",
    );
  });

  it("offers to clear the filters that emptied the period", () => {
    const onClearFilters = vi.fn();

    render(
      <CalendarEmpty
        emptiness={{ kind: "filter" }}
        onClearFilters={onClearFilters}
        onJump={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onClearFilters).toHaveBeenCalledExactlyOnceWith();
  });

  it("offers nothing to clear when the period is empty of itself", () => {
    render(
      <CalendarEmpty
        emptiness={{ kind: "match" }}
        onClearFilters={() => {}}
        onJump={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  it("is announced politely rather than interrupting", () => {
    render(
      <CalendarEmpty
        emptiness={{ kind: "match" }}
        onJump={() => {}}
      />,
    );

    expect(screen.getByRole("status").textContent).toContain("No events");
  });
});
