import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createFilterQuery, createFilterRule } from "@codebase/presentation";

import { stubAnimations } from "../../../../testing/animations";
import {
  AuthorEra,
  LibraryGroupField,
} from "../../../graphql/generated/operations";

import { LibraryToolbar } from "./library-toolbar";
import {
  createLibraryFilterFields,
  toFilterParameters,
  toFilterQuery,
} from "./library-toolbar.utilities";

import type { LibraryToolbarProperties } from "./library-toolbar";
import type { FilterRule } from "@codebase/presentation";

stubAnimations();

const FACETS = { inscriptionTypes: [], materials: [], provinces: [] };

/** The properties a toolbar needs, with spies for its callbacks. */
function properties(
  overrides: Partial<LibraryToolbarProperties> = {},
): LibraryToolbarProperties {
  return {
    facets: FACETS,
    filters: {},
    limit: 25,
    onFilters: vi.fn<LibraryToolbarProperties["onFilters"]>(),
    onGroups: vi.fn<LibraryToolbarProperties["onGroups"]>(),
    onLimit: vi.fn<LibraryToolbarProperties["onLimit"]>(),
    onPage: vi.fn<LibraryToolbarProperties["onPage"]>(),
    onSearch: vi.fn<LibraryToolbarProperties["onSearch"]>(),
    onSorts: vi.fn<LibraryToolbarProperties["onSorts"]>(),
    page: 1,
    pageCount: 3,
    search: "",
    totalCount: 90,
    ...overrides,
  };
}

describe(LibraryToolbar, () => {
  it("applies its class name", () => {
    render(
      <LibraryToolbar
        className="library-toolbar"
        {...properties()}
      />,
    );

    expect(screen.getByTestId("library-toolbar").className).toBe(
      "library-toolbar",
    );
  });

  it("lets the search shrink to a minimum before the strips wrap", () => {
    render(<LibraryToolbar {...properties()} />);

    const search = screen.getByTestId("library-search");

    expect(search.className).toContain("flex-1");
    expect(search.className).toContain("min-w-64");
    expect(search.parentElement?.className).toContain("flex-wrap");
  });

  it("offers the Page menu beside Filter and Sort", () => {
    render(<LibraryToolbar {...properties()} />);

    expect(screen.getByRole("button", { name: "Page" })).toBeDefined();
  });

  it("shows the range of authors on view beside the Page menu", () => {
    render(<LibraryToolbar {...properties()} />);

    expect(screen.getByText("1 to 25 of 90")).toBeDefined();
  });

  it("shows a Group strip with a segment for each active level", () => {
    render(
      <LibraryToolbar {...properties({ groups: [LibraryGroupField.Era] })} />,
    );

    expect(screen.getByRole("button", { name: "Group" })).toBeDefined();
    expect(screen.getByTestId("library-chip").textContent).toBe("Era");
  });

  it("shows no chips, no Reset, and no count on Filter when nothing is set", () => {
    render(<LibraryToolbar {...properties()} />);

    expect(screen.queryByTestId("library-chip")).toBeNull();
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
    expect(screen.getByRole("button", { name: "Filter" })).toBeDefined();
  });

  it("joins an active filter to the Filter button as a chip, with no count or Reset", () => {
    render(
      <LibraryToolbar
        {...properties({ filters: { eras: [AuthorEra.Late] } })}
      />,
    );

    expect(screen.getByRole("button", { name: "Filter" }).textContent).toBe(
      "Filter",
    );
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
    expect(
      screen.getByRole("group", { name: /Era is any of Late/u }),
    ).toBeDefined();
  });

  describe("filter utilities", () => {
    it("offers every attribute in menu order", () => {
      const fields = createLibraryFilterFields(FACETS, new Set());

      expect(fields.map(({ label }) => label)).toStrictEqual([
        "Era",
        "Author years",
        "Inscription province",
        "Inscription type",
        "Material",
        "Inscription years",
        "Print year",
        "Line count",
        "Word count",
      ]);
    });

    it("describes each facet value with its count", () => {
      const provinces = createLibraryFilterFields(
        {
          ...FACETS,
          provinces: [
            { count: 12, value: "Dacia" },
            { count: 1, value: "Syria" },
          ],
        },
        new Set(),
      ).find(({ id }) => id === "provinces");

      expect(provinces?.options).toStrictEqual([
        { description: "12 texts", label: "Dacia", value: "Dacia" },
        { description: "1 text", label: "Syria", value: "Syria" },
      ]);
    });

    it("disables a field already in use", () => {
      const fields = createLibraryFilterFields(FACETS, new Set(["eras"]));

      expect(fields.map(({ disabled }) => disabled)[0]).toBe(true);
      expect(fields.filter(({ disabled }) => disabled)).toHaveLength(1);
    });

    it("builds one rule per filter that is set", () => {
      const query = toFilterQuery({
        eras: [AuthorEra.Late],
        lineCountMaximum: 900,
        provinces: ["Dacia"],
      });

      expect(query.rules).toMatchObject([
        { operator: "is_any_of", path: ["eras"], value: [AuthorEra.Late] },
        { operator: "is_any_of", path: ["provinces"], value: ["Dacia"] },
        { operator: "between", path: ["lineCount"], value: [undefined, 900] },
      ]);
      expect(toFilterQuery({}).rules).toStrictEqual([]);
    });

    it("round-trips the filters a tree was built from", () => {
      const filters = {
        authorYearsMaximum: 19,
        authorYearsMinimum: -70,
        eras: [AuthorEra.Classical],
        materials: ["marble"],
      };

      expect(toFilterParameters(toFilterQuery(filters))).toStrictEqual(filters);
    });

    it("skips a chip with no condition yet", () => {
      const rules: FilterRule[] = [
        createFilterRule({ id: "a", operator: "", path: ["eras"] }),
      ];
      const query = createFilterQuery(rules);

      expect(toFilterParameters(query)).toStrictEqual({});
    });

    it("drops an empty list, a bad era, and a fractional bound", () => {
      const rules: FilterRule[] = [
        createFilterRule({
          id: "a",
          operator: "is_any_of",
          path: ["provinces"],
          value: [],
        }),
        createFilterRule({
          id: "b",
          operator: "is_any_of",
          path: ["eras"],
          value: ["NOPE"],
        }),
        createFilterRule({
          id: "c",
          operator: "between",
          path: ["wordCount"],
          value: [1.5, 20],
        }),
      ];
      const query = createFilterQuery(rules);
      const parameters = toFilterParameters(query);

      expect(parameters.wordCountMaximum).toBe(20);
      expect(parameters.provinces).toBeUndefined();
      expect(parameters.eras).toBeUndefined();
      expect(parameters.wordCountMinimum).toBeUndefined();
    });
  });
});
