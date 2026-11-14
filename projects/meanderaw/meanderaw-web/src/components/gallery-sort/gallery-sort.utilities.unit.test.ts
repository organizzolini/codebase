import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { resolveSortField } from "./gallery-sort.utilities";

const CATALOG = FIXTURE_CHARACTERISTICS;

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
