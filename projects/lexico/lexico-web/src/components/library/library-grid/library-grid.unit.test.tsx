import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AuthorEra,
  LibraryGroupField,
} from "../../../graphql/generated/operations";

import { LibraryGrid } from "./library-grid";

import type { LibraryAuthorRow } from "./library-grid.types";

/** An author row of the given name and era. */
function rowOf(name: string, era: AuthorEra | null): LibraryAuthorRow {
  return {
    author: {
      endYear: null,
      era,
      fullName: null,
      id: name,
      name,
      slug: name.toLowerCase(),
      startYear: null,
    },
    matches: [],
    workCount: 0,
    works: [],
  };
}

describe(LibraryGrid, () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", () => ({
      addEventListener: vi.fn<() => void>(),
      matches: true,
      removeEventListener: vi.fn<() => void>(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies its class name", () => {
    render(
      <LibraryGrid
        authors={[]}
        className="library-grid"
        query={{ search: "" }}
      />,
    );

    expect(screen.getByTestId("library-grid").className).toBe("library-grid");
  });

  it("renders one card per author", () => {
    const author = {
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
    };
    render(
      <LibraryGrid
        authors={[author]}
        query={{ search: "" }}
      />,
    );

    expect(screen.getAllByTestId("library-author-card")).toHaveLength(1);
  });

  it("heads each run of authors under a group, and the first card of a page", () => {
    render(
      <LibraryGrid
        authors={[
          rowOf("Ennius", AuthorEra.Archaic),
          rowOf("Plautus", AuthorEra.Archaic),
          rowOf("Cicero", AuthorEra.Classical),
          rowOf("Anon", null),
        ]}
        groups={[LibraryGroupField.Era]}
        query={{ search: "" }}
      />,
    );

    expect(
      screen
        .getAllByTestId("library-group-heading")
        .map((heading) => heading.textContent),
    ).toStrictEqual(["Archaic", "Classical", "No era"]);
    expect(screen.getAllByTestId("library-author-card")).toHaveLength(4);
  });

  it("draws no heading when nothing is grouped", () => {
    render(
      <LibraryGrid
        authors={[rowOf("Ennius", AuthorEra.Archaic)]}
        query={{ search: "" }}
      />,
    );

    expect(screen.queryByTestId("library-group-heading")).toBeNull();
  });
});
