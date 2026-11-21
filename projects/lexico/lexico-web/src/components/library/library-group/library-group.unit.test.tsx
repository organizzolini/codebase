import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryGroupField } from "../../../graphql/generated/operations";

import { LibraryGroup } from "./library-group";

import type { LibraryGroupProperties } from "./library-group";

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

    expect(screen.getByTestId("library-group-segment").textContent).toBe("Era");
    expect(onGroups).toHaveBeenCalledExactlyOnceWith([]);
  });
});
