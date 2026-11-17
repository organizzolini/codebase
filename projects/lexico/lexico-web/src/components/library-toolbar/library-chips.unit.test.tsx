import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibrarySortField } from "../../graphql/generated/operations";

import { LibraryChips } from "./library-chips";

import type { LibraryChipsProperties } from "./library-chips";

describe(LibraryChips, () => {
  it("applies its class name", () => {
    render(
      <LibraryChips
        className="library-chips"
        onReset={vi.fn<LibraryChipsProperties["onReset"]>()}
        onSort={vi.fn<LibraryChipsProperties["onSort"]>()}
        rules={[]}
      />,
    );

    expect(screen.getByTestId("library-chips").className).toBe("library-chips");
  });

  it("shows the sort chip and resets", () => {
    const onReset = vi.fn<LibraryChipsProperties["onReset"]>();
    render(
      <LibraryChips
        onReset={onReset}
        onSort={vi.fn<LibraryChipsProperties["onSort"]>()}
        rules={[]}
        sort={LibrarySortField.AuthorEra}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByTestId("library-chips")).toBeDefined();
    expect(onReset).toHaveBeenCalledExactlyOnceWith();
  });
});
