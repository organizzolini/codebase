import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { searchFields } from "./filter-search.utilities";
import { createFilterFields } from "./gallery-filter-builder.utilities";

import type { FilterField } from "./gallery-filter-builder.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

/** The keys the groups list, flattened, in order. */
function keys(result: ReturnType<typeof searchFields>): string[] {
  return result.groups.flatMap((group) => group.fields.map(({ key }) => key));
}

describe(searchFields, () => {
  it("lists every field with no words typed, shape first, then the catalog by category", () => {
    const result = searchFields(FIELDS, "");

    expect(result.groups.map(({ category }) => category)).toStrictEqual([
      "shape",
      "path",
      "submatrix",
    ]);
    expect(keys(result)).toStrictEqual([
      "rows",
      "columns",
      "lattice",
      "repeats",
      "isHardcoded",
      "junctionCount",
      "isChain",
    ]);
    expect(result.total).toBe(7);
  });

  it("matches words in any order against name, key, description and category", () => {
    expect(keys(searchFields(FIELDS, "junction"))).toStrictEqual([
      "junctionCount",
    ]);
    expect(keys(searchFields(FIELDS, "chain submatrix"))).toStrictEqual([
      "isChain",
    ]);
    expect(keys(searchFields(FIELDS, "PATH ink"))).toStrictEqual([
      "junctionCount",
    ]);
    expect(keys(searchFields(FIELDS, "xyz"))).toStrictEqual([]);
  });

  it("lists at most a limit of them, and says how many matched", () => {
    const many: FilterField[] = Array.from({ length: 60 }, (_, index) => ({
      category: index % 2 === 0 ? "path" : "compound",
      description: "Counts something",
      isInteger: false,
      isPattern: false,
      key: `count${String(index)}`,
      label: `Count ${String(index)}`,
      type: "number",
      valueCounts: [],
    }));
    const result = searchFields(many, "count");

    expect(keys(result)).toHaveLength(50);
    expect(result.total).toBe(60);
    expect(searchFields(many, "count", 5).groups.at(0)?.category).toBe(
      "compound",
    );
  });
});
