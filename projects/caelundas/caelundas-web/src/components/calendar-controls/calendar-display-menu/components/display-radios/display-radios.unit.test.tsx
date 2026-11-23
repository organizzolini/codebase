import { fireEvent, render, screen } from "@testing-library/react";
import { Moon, Sun } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { DisplayRadios } from "./display-radios";

const OPTIONS = [
  { icon: Sun, label: "Day", value: "day" },
  { icon: Moon, label: "Night", value: "night" },
];

describe(DisplayRadios, () => {
  it("applies its class name", () => {
    render(
      <DisplayRadios
        className="display-radios"
        label="Time"
        onValueChange={vi.fn()}
        options={OPTIONS}
        value="day"
      />,
    );

    expect(screen.getByTestId("display-radios").className).toContain(
      "display-radios",
    );
  });

  it("checks the choice picked", () => {
    render(
      <DisplayRadios
        label="Time"
        onValueChange={vi.fn()}
        options={OPTIONS}
        value="night"
      />,
    );

    expect(
      screen.getByRole("radio", { name: "Night" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("radio", { name: "Day" }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("reports the choice that is picked", () => {
    const onValueChange = vi.fn<(value: string) => void>();

    render(
      <DisplayRadios
        label="Time"
        onValueChange={onValueChange}
        options={OPTIONS}
        value="day"
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Night" }));

    expect(onValueChange).toHaveBeenCalledWith("night");
  });
});
