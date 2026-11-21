import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Filters } from "@codebase/presentation";

import { FIXTURE_CHARACTERISTICS } from "../../../../../../testing/meanders-api";
import { createFilterFields } from "../filter-model/filter-model.utilities";
import { createFilterQueryFields } from "../filter-query/filter-fields.utilities";
import { DEFAULT_FILTER_LINK } from "../filter-query/filter-query.constants";
import { toFilterQuery } from "../filter-query/filter-query.utilities";

import { FilterChipRow } from "./filter-chip-row";

import type {
  GalleryFilterQuery,
  GalleryFilterValue,
} from "../filter-query/filter-query.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

/** Renders the row inside the Filters holding a tree. */
function renderRow(query: GalleryFilterQuery): void {
  render(
    <Filters<GalleryFilterValue>
      fields={createFilterQueryFields(FIELDS)}
      onQueryChange={vi.fn<(query: GalleryFilterQuery) => void>()}
      query={query}
    >
      <FilterChipRow />
    </Filters>,
  );
}

describe(FilterChipRow, () => {
  it("draws a chip for rows and repeats, and one for each rule, nested ones too", () => {
    renderRow(
      toFilterQuery(
        {
          ...DEFAULT_FILTER_LINK,
          filter: {
            combinator: "and",
            rules: [
              {
                combinator: "or",
                rules: [{ field: "isChain", operator: "is", value: true }],
              },
              { field: "junctionCount", operator: "gte", value: 3 },
            ],
          },
        },
        FIELDS,
      ),
    );

    const chips = screen.getAllByRole("group");

    expect(chips).toHaveLength(4);
    expect(chips.map((chip) => chip.getAttribute("aria-label"))).toStrictEqual([
      expect.stringContaining("Rows"),
      expect.stringContaining("Repeats"),
      expect.stringContaining("Chain"),
      expect.stringContaining("Junction count"),
    ]);
  });

  it("draws nothing while the tree has no rules", () => {
    renderRow({ ...toFilterQuery(DEFAULT_FILTER_LINK, FIELDS), rules: [] });

    expect(screen.queryAllByRole("group")).toHaveLength(0);
  });
});
