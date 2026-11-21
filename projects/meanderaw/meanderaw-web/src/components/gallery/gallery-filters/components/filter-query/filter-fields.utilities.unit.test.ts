import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../../../testing/meanders-api";
import { createFilterFields } from "../filter-model/filter-model.utilities";

import { createFilterQueryFields } from "./filter-fields.utilities";

import type {
  GalleryFilterField,
  GalleryFilterValue,
} from "./filter-query.types";
import type { FilterValidateContext } from "@codebase/presentation";

const FIELDS = createFilterQueryFields(
  createFilterFields(FIXTURE_CHARACTERISTICS),
);

/** What a field's check says of a value. */
function check(
  field: GalleryFilterField,
  value: number,
): false | null | string | undefined {
  return field.validate?.({
    values: [value],
  } as unknown as FilterValidateContext<GalleryFilterValue>);
}

/** The leaf a path names. */
function leaf(category: string, id: string): GalleryFilterField {
  const found = FIELDS.find((branch) => branch.id === category)?.fields?.find(
    (field) => field.id === id,
  );

  if (found === undefined) {
    throw new Error(`${category}.${id}`);
  }

  return found;
}

describe(createFilterQueryFields, () => {
  it("makes a branch per category, shape first, rows and repeats leading it", () => {
    expect(FIELDS.map(({ id, label }) => [id, label])).toStrictEqual([
      ["shape", "Shape"],
      ["path", "Path"],
      ["submatrix", "Submatrix"],
    ]);
    expect(FIELDS[0]?.fields?.map(({ id }) => id)).toStrictEqual([
      "rows",
      "repeats",
      "columns",
      "lattice",
      "isHardcoded",
    ]);
    expect(FIELDS[1]?.fields?.map(({ id }) => id)).toStrictEqual([
      "junctionCount",
    ]);
  });

  it("keeps rows and repeats not offered, since every filter holds them already", () => {
    expect(leaf("shape", "rows").disabled).toBe(true);
    expect(leaf("shape", "repeats").disabled).toBe(true);
    expect(leaf("shape", "columns").disabled).toBeUndefined();
  });

  it("gives each kind of field its operators and editor", () => {
    const operators = (field: GalleryFilterField): string[] =>
      (Array.isArray(field.operators) ? field.operators : []).map(
        ({ value }) => value,
      );

    expect(operators(leaf("shape", "rows"))).toStrictEqual([
      "eq",
      "ne",
      "gt",
      "gte",
      "lt",
      "lte",
      "between",
    ]);
    expect(operators(leaf("shape", "repeats"))).toStrictEqual(["eq"]);
    expect(operators(leaf("submatrix", "isChain"))).toStrictEqual([
      "is",
      "is_not",
    ]);
    expect(operators(leaf("shape", "lattice"))).toStrictEqual(["eq", "ne"]);
    expect(leaf("shape", "lattice").type).toBe("text");
    expect(leaf("submatrix", "isChain").type).toBe("boolean");
    expect(leaf("path", "junctionCount").type).toBe("number");
    expect(leaf("path", "junctionCount").defaultOperator).toBe("eq");
    expect(leaf("path", "junctionCount").description).toContain(
      "Pieces of ink.",
    );
  });

  it("refuses a repeats value outside 1 to 24, and a fraction where whole things are counted", () => {
    const repeats = leaf("shape", "repeats");

    expect(check(repeats, 12)).toBeUndefined();
    expect(check(repeats, 1)).toBeUndefined();
    expect(check(repeats, 24)).toBeUndefined();
    expect(check(repeats, 25)).toBe("Repeats run from 1 to 24.");
    expect(check(repeats, 0)).toBe("Repeats run from 1 to 24.");
    expect(check(repeats, 1.5)).toBe("Repeats run from 1 to 24.");
    expect(check(leaf("shape", "rows"), 2)).toBeUndefined();
    expect(check(leaf("shape", "rows"), 2.5)).toBe("Enter a whole number.");
    expect(check(leaf("shape", "columns"), 2.5)).toBe("Enter a whole number.");
    expect(leaf("path", "junctionCount").validate).toBeUndefined();
  });
});
