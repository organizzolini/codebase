import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthorEra } from "../../graphql/generated/operations";

import { LibraryFilters } from "./library-filters";
import { draftErrors, fromDraft, toDraft } from "./library-filters.utilities";

import type { LibraryFilterParameters } from "../library-grid/library-grid.types";

describe(LibraryFilters, () => {
  it("applies its class name", () => {
    render(
      <LibraryFilters
        className="library-filters"
        filters={{}}
        onApply={vi.fn<(filters: LibraryFilterParameters) => void>()}
        onReset={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByTestId("library-filters").className).toBe(
      "library-filters",
    );
  });

  it("applies what was ticked and typed", () => {
    const onApply = vi.fn<(filters: LibraryFilterParameters) => void>();
    render(
      <LibraryFilters
        filters={{}}
        onApply={onApply}
        onReset={vi.fn<() => void>()}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Classical" }));
    fireEvent.change(screen.getByLabelText("Provinces"), {
      target: { value: "Dacia, Syria" },
    });
    fireEvent.change(screen.getByLabelText("Line count minimum"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        eras: [AuthorEra.Classical],
        lineCountMinimum: 10,
        provinces: ["Dacia", "Syria"],
      }),
    );
  });

  it("opens and closes the panel from its button", () => {
    render(
      <LibraryFilters
        filters={{}}
        onApply={vi.fn<(filters: LibraryFilterParameters) => void>()}
        onReset={vi.fn<() => void>()}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Filters" });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("reports a reset", () => {
    const onReset = vi.fn<() => void>();
    render(
      <LibraryFilters
        filters={{ eras: [AuthorEra.Late] }}
        onApply={vi.fn<(filters: LibraryFilterParameters) => void>()}
        onReset={onReset}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(onReset).toHaveBeenCalledWith();
  });

  it("round-trips the filters it was filled from", () => {
    const filters = fromDraft(
      toDraft({
        authorYearsMaximum: 14,
        authorYearsMinimum: -70,
        eras: [AuthorEra.Classical],
        materials: ["marble"],
      }),
    );

    expect([
      filters.authorYearsMaximum,
      filters.authorYearsMinimum,
      filters.eras,
      filters.materials,
    ]).toStrictEqual([14, -70, [AuthorEra.Classical], ["marble"]]);
  });

  it("drops a range bound that is not a number", () => {
    const draft = toDraft({});
    draft.text["lineCountMinimum"] = "many";

    expect(fromDraft(draft).lineCountMinimum).toBeUndefined();
  });

  it("names a bound that is not a whole number", () => {
    const draft = toDraft({});
    draft.text["lineCountMinimum"] = "1.5";
    draft.text["wordCountMaximum"] = "many";

    expect(draftErrors(draft)).toStrictEqual([
      "Line count minimum must be a whole number.",
      "Word count maximum must be a whole number.",
    ]);
  });

  it("names a range whose minimum is above its maximum", () => {
    const draft = toDraft({ authorYearsMaximum: -70, authorYearsMinimum: 14 });

    expect(draftErrors(draft)).toStrictEqual([
      "Author years minimum is greater than its maximum.",
    ]);
  });

  it("finds no error in a valid draft", () => {
    expect(draftErrors(toDraft({ lineCountMinimum: 10 }))).toStrictEqual([]);
  });

  it("shows what is wrong instead of applying an invalid range", () => {
    const onApply = vi.fn<(filters: LibraryFilterParameters) => void>();
    render(
      <LibraryFilters
        filters={{}}
        onApply={onApply}
        onReset={vi.fn<() => void>()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Line count minimum"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText("Line count maximum"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(screen.getByRole("alert").textContent).toContain(
      "Line count minimum is greater than its maximum.",
    );
    expect(onApply).not.toHaveBeenCalled();
  });
});
