import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DropdownMenu, DropdownMenuContent } from "@codebase/presentation";

import { CalendarColorOptions } from "./calendar-color-options";

import type { ReactNode } from "react";

const FACETS = [
  {
    id: "planet",
    name: "Planet",
    values: [{ count: 2, depth: 1, id: "mars", name: "Mars", path: "Mars" }],
  },
];

// The options belong inside a dropdown menu, so each is drawn in one held open.
function OpenMenu(properties: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <DropdownMenu open>
      <DropdownMenuContent>{properties.children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

describe(CalendarColorOptions, () => {
  it("applies its class name", () => {
    render(
      <CalendarColorOptions
        className="calendar-color-options"
        colorBy={undefined}
        facets={FACETS}
        onColorByChange={() => {}}
      />,
      { wrapper: OpenMenu },
    );

    expect(screen.getByTestId("calendar-color-options").className).toBe(
      "calendar-color-options",
    );
  });

  it("says what the events are colored by, the type unless told otherwise", () => {
    render(
      <CalendarColorOptions
        colorBy={undefined}
        facets={FACETS}
        onColorByChange={() => {}}
      />,
      { wrapper: OpenMenu },
    );

    expect(screen.getByText("Color by: Type")).toBeDefined();
  });

  it("names the field the events are colored by", () => {
    render(
      <CalendarColorOptions
        colorBy={{ depth: 1, field: "tag:planet" }}
        facets={FACETS}
        onColorByChange={() => {}}
      />,
      { wrapper: OpenMenu },
    );

    expect(screen.getByText("Color by: Planet")).toBeDefined();
  });

  it("opens the picker for it", async () => {
    render(
      <CalendarColorOptions
        colorBy={undefined}
        facets={FACETS}
        onColorByChange={() => {}}
      />,
      { wrapper: OpenMenu },
    );
    fireEvent.click(screen.getByText("Color by: Type"));

    await expect(
      screen.findByTestId("calendar-color-by"),
    ).resolves.toBeDefined();
  });
});
