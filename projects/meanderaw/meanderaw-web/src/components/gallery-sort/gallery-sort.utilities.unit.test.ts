import { describe, expect, it } from "vitest";

import { resolveSortField } from "./gallery-sort.utilities";

const CATALOG = [
  {
    category: "submatrix",
    description: "Holds a chain.",
    isPattern: true,
    key: "isChain",
    name: "Chain",
    valueType: "boolean",
  },
];

describe(resolveSortField, () => {
  it("keeps a shape field and a key in the catalog", () => {
    expect(resolveSortField("rows", CATALOG)).toBe("rows");
    expect(resolveSortField("isChain", CATALOG)).toBe("isChain");
  });

  it("drops a field that is neither, and has nothing to drop without one", () => {
    expect(resolveSortField("nope", CATALOG)).toBeUndefined();
    expect(resolveSortField(undefined, CATALOG)).toBeUndefined();
  });
});
