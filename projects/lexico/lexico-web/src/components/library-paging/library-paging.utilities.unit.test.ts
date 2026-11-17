import { describe, expect, it } from "vitest";

import { listPages } from "./library-paging.utilities";

describe(listPages, () => {
  it("numbers every page from one", () => {
    expect(listPages(3)).toStrictEqual([1, 2, 3]);
  });

  it("offers the first page when there are none", () => {
    expect(listPages(0)).toStrictEqual([1]);
  });
});
