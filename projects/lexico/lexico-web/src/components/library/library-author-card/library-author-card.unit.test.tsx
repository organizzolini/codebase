// cspell:ignore Maro
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryAuthorCard } from "./library-author-card";

describe(LibraryAuthorCard, () => {
  it("applies its class name", () => {
    render(
      <LibraryAuthorCard
        className="library-author-card"
        query={{ search: "" }}
        row={{
          author: {
            endYear: null,
            era: null,
            fullName: null,
            id: "a1",
            name: "Ennius",
            slug: "ennius",
            startYear: null,
          },
          matches: [],
          workCount: 0,
          works: [],
        }}
      />,
    );

    expect(screen.getByTestId("library-author-card").className).toBe(
      "library-author-card",
    );
  });

  it("bolds the matched part of the full name", () => {
    render(
      <LibraryAuthorCard
        query={{ search: "vergilius" }}
        row={{
          author: {
            endYear: null,
            era: null,
            fullName: "Publius Vergilius Maro",
            id: "a2",
            name: "Vergil",
            slug: "vergil",
            startYear: null,
          },
          matches: [{ end: 17, field: "fullName", start: 8 }],
          workCount: 0,
          works: [],
        }}
      />,
    );

    expect(screen.getByText("Vergilius", { selector: "strong" })).toBeDefined();
  });

  it("toggles when the card is clicked outside its controls", () => {
    render(
      <LibraryAuthorCard
        query={{ search: "" }}
        row={{
          author: {
            endYear: null,
            era: null,
            fullName: null,
            id: "a3",
            name: "Ennius",
            slug: "ennius",
            startYear: null,
          },
          matches: [],
          workCount: 1,
          works: [],
        }}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Expand Ennius" });

    fireEvent.click(screen.getByTestId("library-author-preview"));

    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("lists every work in a frame without clamping the lines", () => {
    const titles = ["Aeneid", "Eclogues", "Georgics", "Culex"];
    render(
      <LibraryAuthorCard
        query={{ search: "" }}
        row={{
          author: {
            endYear: null,
            era: null,
            fullName: null,
            id: "a4",
            name: "Vergil",
            slug: "vergil",
            startYear: null,
          },
          matches: [],
          workCount: titles.length,
          works: titles.map((title) => ({
            childCount: 0,
            matches: [],
            text: {
              collection: null,
              edition: null,
              editors: null,
              findSpot: null,
              id: title,
              inscriptionType: null,
              lineCount: null,
              material: null,
              province: null,
              slug: title,
              title,
              type: "text",
              wordCount: null,
            },
          })),
        }}
      />,
    );
    const preview = screen.getByTestId("library-author-preview");

    expect(preview.textContent).toBe(titles.join(" • "));
    expect(preview.className).not.toContain("line-clamp");
    expect(preview.closest('[data-slot="frame"]')).not.toBeNull();
  });

  it("keeps the caret transparent once the card is expanded", () => {
    render(
      <LibraryAuthorCard
        query={{ search: "" }}
        row={{
          author: {
            endYear: null,
            era: null,
            fullName: null,
            id: "a5",
            name: "Ennius",
            slug: "ennius",
            startYear: null,
          },
          matches: [],
          workCount: 0,
          works: [],
        }}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Expand Ennius" });

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.className).toContain(
      "aria-expanded:not-hover:bg-transparent",
    );
  });
});
