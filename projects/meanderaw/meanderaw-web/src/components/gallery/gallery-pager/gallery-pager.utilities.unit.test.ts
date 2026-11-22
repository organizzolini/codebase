import { describe, expect, it } from "vitest";

import { describeRange } from "./gallery-pager.utilities";

describe(describeRange, () => {
  it("words one page as the meanders it covers", () => {
    expect(describeRange({ first: 2, last: 2, size: 24, total: 182_397 })).toBe(
      "25 to 48 of 182,397",
    );
  });

  it("covers every page of the window, a multiple of the size", () => {
    expect(describeRange({ first: 1, last: 2, size: 24, total: 182_397 })).toBe(
      "1 to 48 of 182,397",
    );
  });

  it("ends at the total on the last page", () => {
    expect(describeRange({ first: 3, last: 3, size: 24, total: 50 })).toBe(
      "49 to 50 of 50",
    );
    expect(describeRange({ first: 2, last: 4, size: 24, total: 50 })).toBe(
      "25 to 50 of 50",
    );
  });

  it("says 0 of 0 for no meanders", () => {
    expect(describeRange({ first: 1, last: 1, size: 24, total: 0 })).toBe(
      "0 of 0",
    );
  });
});
