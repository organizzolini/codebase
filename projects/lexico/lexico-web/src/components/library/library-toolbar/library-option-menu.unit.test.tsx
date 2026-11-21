import { fireEvent, render, screen } from "@testing-library/react";
import { Sunrise, Sunset } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { stubAnimations } from "../../../../testing/animations";

import { LibraryOptionMenu } from "./library-option-menu";

import type { LibraryOptionMenuProperties } from "./library-option-menu";

stubAnimations();

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
    selected: ["end"],
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

    expect(end.getAttribute("aria-selected")).toBe("true");

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

  it("opens a category into its own column and reports a pick from it", async () => {
    const onToggle = vi.fn<LibraryOptionMenuProperties["onToggle"]>();
    render(
      <LibraryOptionMenu
        {...properties({
          onToggle,
          options: [
            {
              children: OPTIONS,
              icon: Sunrise,
              label: "Years",
              value: "years",
            },
          ],
          selected: [],
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByRole("option", { name: /^Years/u }));

    expect(onToggle).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole("option", { name: "End" }));

    expect(onToggle).toHaveBeenCalledExactlyOnceWith("end");
  });
});
