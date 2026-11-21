import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryGroupField } from "../../../graphql/generated/operations";

import { LibraryGroup } from "./library-group";

import type { LibraryGroupProperties } from "./library-group";
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

describe(LibraryGroup, () => {
  it("applies its class name", () => {
    render(
      <LibraryGroup
        className="library-group"
        onGroups={vi.fn<LibraryGroupProperties["onGroups"]>()}
      />,
    );

    expect(screen.getByTestId("library-group").className).toBe("library-group");
  });

  it("adds a level when its attribute is checked", async () => {
    const onGroups = vi.fn<LibraryGroupProperties["onGroups"]>();
    render(<LibraryGroup onGroups={onGroups} />);

    fireEvent.click(screen.getByRole("button", { name: "Group" }));
    fireEvent.click(await screen.findByRole("option", { name: "Era" }));

    expect(onGroups).toHaveBeenCalledExactlyOnceWith([LibraryGroupField.Era]);
  });

  it("shows a segment for each level and removes one", () => {
    const onGroups = vi.fn<LibraryGroupProperties["onGroups"]>();
    render(
      <LibraryGroup
        groups={[LibraryGroupField.Era]}
        onGroups={onGroups}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Remove grouping by Era" }),
    );

    expect(screen.getByTestId("library-chip").textContent).toBe("Era");
    expect(onGroups).toHaveBeenCalledExactlyOnceWith([]);
  });

  it("gives each segment a drag handle, and applies a drag as the new order", () => {
    const onGroups = vi.fn<LibraryGroupProperties["onGroups"]>();
    render(
      <LibraryGroup
        groups={[LibraryGroupField.Era]}
        onGroups={onGroups}
      />,
    );

    expect(screen.getByRole("button", { name: "Reorder Era" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Reverse" }));

    expect(onGroups).toHaveBeenCalledExactlyOnceWith([LibraryGroupField.Era]);
  });
});
