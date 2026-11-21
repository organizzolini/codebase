import { fireEvent, render, screen, within } from "@testing-library/react";
import { Sunrise, Sunset } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { LibraryOptionMenu } from "./library-option-menu";

import type { LibraryOptionMenuProperties } from "./library-option-menu";

const OPTIONS = [
  { icon: Sunrise, label: "Start", value: "start" },
  { icon: Sunset, label: "End", value: "end" },
];

/** The properties a menu needs, with a spy for its toggle. */
function properties(
  overrides: Partial<LibraryOptionMenuProperties> = {},
): LibraryOptionMenuProperties {
  return {
    icon: Sunrise,
    label: "Sort",
    onToggle: vi.fn<LibraryOptionMenuProperties["onToggle"]>(),
    options: OPTIONS,
    selected: new Set(["end"]),
    title: "Sort by",
    ...overrides,
  };
}

describe(LibraryOptionMenu, () => {
  it("applies its class name", () => {
    render(
      <LibraryOptionMenu
        {...properties()}
        className="library-option-menu"
      />,
    );

    expect(screen.getByTestId("library-option-menu").className).toBe(
      "library-option-menu",
    );
  });

  it("lists the options, checking the selected, and reports a pick", async () => {
    const onToggle = vi.fn<LibraryOptionMenuProperties["onToggle"]>();
    render(<LibraryOptionMenu {...properties({ onToggle })} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    const end = await screen.findByRole("option", { name: "End" });

    expect(within(end).getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "true",
    );

    fireEvent.click(screen.getByRole("option", { name: "Start" }));

    expect(onToggle).toHaveBeenCalledExactlyOnceWith("start");
  });

  it("narrows the options as the search box is typed in", async () => {
    render(<LibraryOptionMenu {...properties()} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.change(await screen.findByPlaceholderText("Sort by..."), {
      target: { value: "sta" },
    });

    expect(screen.queryByRole("option", { name: "End" })).toBeNull();
    expect(screen.getByRole("option", { name: "Start" })).toBeDefined();
  });
});
