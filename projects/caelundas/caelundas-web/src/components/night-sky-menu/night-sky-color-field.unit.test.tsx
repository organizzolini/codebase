import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NightSkyColorField } from "./night-sky-color-field";
import { SKY_COLORS } from "./night-sky-menu.constants";

const [SKY_TOP] = SKY_COLORS;

if (SKY_TOP === undefined) {
  throw new Error("The menu lists no color");
}

describe(NightSkyColorField, () => {
  it("applies its class name", () => {
    render(
      <NightSkyColorField
        className="night-sky-color-field"
        control={SKY_TOP}
        onValueChange={vi.fn<() => void>()}
        value="#04060f"
      />,
    );

    expect(screen.getByTestId("night-sky-color-field").className).toBe(
      "night-sky-color-field",
    );
  });

  it("sends the color typed into its picker under its link key", async () => {
    const onValueChange = vi.fn<(key: string, value: string) => void>();

    render(
      <NightSkyColorField
        control={SKY_TOP}
        onValueChange={onValueChange}
        value="#04060f"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Sky top/u }));

    const field = await screen.findByRole("textbox");

    fireEvent.change(field, { target: { value: "#102040" } });
    fireEvent.keyDown(field, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith("sky.top", "#102040");
  });
});
