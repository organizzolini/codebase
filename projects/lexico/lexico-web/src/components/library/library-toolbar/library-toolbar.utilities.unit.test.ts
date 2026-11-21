import { describe, expect, it } from "vitest";

import { AuthorEra } from "../../../graphql/generated/operations";

import { isSameFilters } from "./library-toolbar.utilities";

describe(isSameFilters, () => {
  it("matches equal filters", () => {
    expect(
      isSameFilters({ eras: [AuthorEra.Late] }, { eras: [AuthorEra.Late] }),
    ).toBe(true);
  });

  it("tells different filters apart", () => {
    expect(isSameFilters({ eras: [AuthorEra.Late] }, {})).toBe(false);
  });
});
