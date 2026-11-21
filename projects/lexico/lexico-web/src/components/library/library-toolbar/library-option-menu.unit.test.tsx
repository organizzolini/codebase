import { fireEvent, render, screen, within } from "@testing-library/react";
import { Sunrise, Sunset } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { LibraryOptionMenu } from "./library-option-menu";

import type { LibraryOptionMenuProperties } from "./library-option-menu";
import type { ReactNode } from "react";

// jsdom cannot drag, so a stand-in for Sortable reports the reversed order from a button.
vi.mock("@codebase/presentation", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  Sortable: ({
    children,
    onValueChange,
    value,
  }: {
    children: ReactNode;
    onValueChange: (value: string[]) => void;
    value: string[];
  }) => (
    <div>
      {children}
      <button
        onClick={() => {
          onValueChange(value.map((_, index, all) => all.at(-1 - index) ?? ""));
        }}
        type="button"
      >
        Reverse
      </button>
    </div>
  ),
}));
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
    onReorder: vi.fn<LibraryOptionMenuProperties["onReorder"]>(),
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

  it("reports the checked values in their new order after a drag", () => {
    const onReorder = vi.fn<LibraryOptionMenuProperties["onReorder"]>();
    render(
      <LibraryOptionMenu
        {...properties({ onReorder, selected: ["end", "start"] })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reverse" }));

    expect(onReorder).toHaveBeenCalledExactlyOnceWith(["start", "end"]);
  });
});
