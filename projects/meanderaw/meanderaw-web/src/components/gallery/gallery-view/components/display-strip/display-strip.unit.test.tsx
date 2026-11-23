import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DisplayStrip } from "./display-strip";

import type { DisplayStripProperties } from "./display-strip";

/** The properties a strip needs, on the grid. */
function properties(
  overrides: Partial<DisplayStripProperties> = {},
): DisplayStripProperties {
  return {
    onViewChange: vi.fn<DisplayStripProperties["onViewChange"]>(),
    view: "grid",
    ...overrides,
  };
}

describe(DisplayStrip, () => {
  it("applies its class name", () => {
    render(
      <DisplayStrip
        {...properties()}
        className="display-strip"
      />,
    );

    expect(screen.getByTestId("display-strip").className).toBe("display-strip");
  });

  it("joins the Display button and the layout in force in one group", () => {
    render(<DisplayStrip {...properties({ view: "list" })} />);

    expect(screen.getByRole("group", { name: "Display" }).textContent).toBe(
      "DisplayList",
    );
  });

  it("opens the same menu from either segment, listing the layouts with their descriptions", async () => {
    render(<DisplayStrip {...properties()} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));

    const options = await screen.findAllByRole("option");

    expect(
      options.map((option) => option.getAttribute("aria-selected")),
    ).toStrictEqual(["true", "false"]);
    expect(screen.getByText("Cards in a list, one to a row")).toBeDefined();
  });

  it("opens the menu from the value segment too, and hands over the layout picked", async () => {
    const onViewChange = vi.fn<DisplayStripProperties["onViewChange"]>();

    render(<DisplayStrip {...properties({ onViewChange })} />);
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    fireEvent.click(await screen.findByRole("option", { name: /List/u }));

    expect(onViewChange).toHaveBeenCalledExactlyOnceWith("list");
  });
});
