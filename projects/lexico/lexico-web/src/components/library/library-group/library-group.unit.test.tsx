import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { stubAnimations } from "../../../../testing/animations";
import { LibraryGroupField } from "../../../graphql/generated/operations";

import { LibraryGroup } from "./library-group";

import type { LibraryGroupProperties } from "./library-group";

stubAnimations();

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

  it("shows a chip for each level, and its menu removes one", async () => {
    const onGroups = vi.fn<LibraryGroupProperties["onGroups"]>();
    render(
      <LibraryGroup
        groups={[LibraryGroupField.Era]}
        onGroups={onGroups}
      />,
    );

    expect(screen.getByTestId("library-chip").textContent).toBe("Era");

    fireEvent.click(screen.getByRole("button", { name: "Options for Era" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onGroups).toHaveBeenCalledExactlyOnceWith([]);
  });

  it("cannot move the only level in either direction", async () => {
    render(
      <LibraryGroup
        groups={[LibraryGroupField.Era]}
        onGroups={vi.fn<LibraryGroupProperties["onGroups"]>()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Options for Era" }));

    const moveLeft = await screen.findByRole("menuitem", {
      name: "Move left",
    });

    expect(moveLeft.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen
        .getByRole("menuitem", { name: "Move right" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });
});
