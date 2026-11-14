import { describe, expect, it } from "vitest";

import { toSortInput } from "./use-gallery-search.utilities";

describe(toSortInput, () => {
  it("leaves the API's order when no field is named", () => {
    expect(toSortInput(undefined, "desc")).toBeUndefined();
  });

  it("names the field and its direction as the API spells them", () => {
    expect(toSortInput("rows", "asc")).toStrictEqual({
      direction: "ASC",
      field: "rows",
    });
    expect(toSortInput("rows", "desc")).toStrictEqual({
      direction: "DESC",
      field: "rows",
    });
  });
});
