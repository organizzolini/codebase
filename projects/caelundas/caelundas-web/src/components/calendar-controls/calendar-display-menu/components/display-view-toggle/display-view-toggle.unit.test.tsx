import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DisplayViewToggle } from "./display-view-toggle";

describe(DisplayViewToggle, () => {
  it("applies its class name", () => {
    render(
      <DisplayViewToggle
        className="display-view-toggle"
        onViewChange={vi.fn()}
        view="week"
      />,
    );

    expect(screen.getByTestId("display-view-toggle").className).toContain(
      "display-view-toggle",
    );
  });

  it("presses the view shown", () => {
    render(
      <DisplayViewToggle
        onViewChange={vi.fn()}
        view="week"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Week" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("reports the view that is pressed", () => {
    const onViewChange = vi.fn();

    render(
      <DisplayViewToggle
        onViewChange={onViewChange}
        view="week"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agenda" }));

    expect(onViewChange).toHaveBeenCalledWith("agenda");
  });

  it("ignores pressing the view already shown", () => {
    const onViewChange = vi.fn();

    render(
      <DisplayViewToggle
        onViewChange={onViewChange}
        view="week"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Week" }));

    expect(onViewChange).not.toHaveBeenCalled();
  });
});
