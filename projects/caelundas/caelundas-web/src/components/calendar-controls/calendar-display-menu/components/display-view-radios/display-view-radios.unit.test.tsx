import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DisplayViewRadios } from "./display-view-radios";

describe(DisplayViewRadios, () => {
  it("applies its class name", () => {
    render(
      <DisplayViewRadios
        className="display-view-radios"
        onViewChange={vi.fn()}
        view="week"
      />,
    );

    expect(screen.getByTestId("display-view-radios").className).toContain(
      "display-view-radios",
    );
  });

  it("checks the view shown", () => {
    render(
      <DisplayViewRadios
        onViewChange={vi.fn()}
        view="week"
      />,
    );

    expect(
      screen.getByRole("radio", { name: "Week" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("radio", { name: "Month" }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("reports the view that is picked", () => {
    const onViewChange = vi.fn();

    render(
      <DisplayViewRadios
        onViewChange={onViewChange}
        view="week"
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Agenda" }));

    expect(onViewChange).toHaveBeenCalledWith("agenda");
  });
});
