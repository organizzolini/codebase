import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarGroupChip } from "./calendar-group-chip";

const GROUP = { id: "id-Aspect", key: "id-Aspect", label: "Aspect" };

describe(CalendarGroupChip, () => {
  it("applies its class name", () => {
    render(
      <CalendarGroupChip
        className="calendar-group-chip"
        count={3}
        group={GROUP}
      />,
    );

    expect(screen.getByTestId("calendar-group-chip").className).toContain(
      "calendar-group-chip",
    );
  });

  it("shows the group's name and count, and is no button without a handler", () => {
    render(
      <CalendarGroupChip
        count={3}
        group={GROUP}
      />,
    );

    expect(screen.getByText("Aspect")).toBeDefined();
    expect(screen.getByTestId("calendar-group-count").textContent).toBe("3");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is a button that says whether it is open and toggles", () => {
    const onToggle = vi.fn<() => void>();

    render(
      <CalendarGroupChip
        color="#f43f5e"
        count={3}
        expanded={false}
        group={GROUP}
        onToggle={onToggle}
      />,
    );

    const button = screen.getByRole("button", { name: "Aspect, 3 events" });

    expect(button.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("tints its pill as an event's name is, and leaves a bare chip to its event's box", () => {
    render(
      <>
        <CalendarGroupChip
          color="#f43f5e"
          count={1}
          group={GROUP}
        />
        <CalendarGroupChip
          color="#f43f5e"
          count={2}
          group={GROUP}
          bare
        />
      </>,
    );

    const [pill, bare] = screen.getAllByTestId("calendar-group-chip");

    expect(pill?.getAttribute("style")).toContain("color-mix");
    expect(bare?.getAttribute("style")).toBeNull();
  });

  it("draws only the icon and count when dense, and none for events with no group", () => {
    render(
      <CalendarGroupChip
        count={2}
        group={{ id: "none", key: null, label: "Other" }}
        onToggle={() => {}}
        dense
        expanded
      />,
    );

    expect(screen.queryByText("Other")).toBeNull();
    expect(screen.getByTestId("calendar-group-count").textContent).toBe("2");
  });
});
