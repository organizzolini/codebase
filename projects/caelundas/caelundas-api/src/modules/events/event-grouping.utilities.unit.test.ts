import { describe, expect, it } from "vitest";

import { parseEventGrouping } from "./event-grouping.utilities";

const ROOT = "0199b1a0-0000-7000-8000-000000000002";

describe(parseEventGrouping, () => {
  it("answers no levels for no grouping and no color", () => {
    expect.hasAssertions();

    expect(parseEventGrouping(null)).toStrictEqual([]);
    expect(parseEventGrouping(undefined)).toStrictEqual([]);
  });

  it("fills the optional parts and puts the color level after the grouping", () => {
    expect.hasAssertions();

    expect(
      parseEventGrouping({
        colorBy: { depth: 2, field: `tag:${ROOT}` },
        levels: [{ field: "year" }],
      }),
    ).toStrictEqual([
      { field: "year", tags: [] },
      { depth: 2, field: `tag:${ROOT}`, tags: [] },
    ]);
  });

  it("allows three levels of grouping and one more for the color", () => {
    expect.hasAssertions();

    const three = [{ field: "year" }, { field: "month" }, { field: "day" }];

    expect(
      parseEventGrouping({ colorBy: { field: "hour" }, levels: three }),
    ).toHaveLength(4);
    expect(() =>
      parseEventGrouping({ levels: [...three, { field: "hour" }] }),
    ).toThrow("too_big");
  });

  it("refuses a depth beyond the deepest a grouping may reach", () => {
    expect.hasAssertions();

    expect(() =>
      parseEventGrouping({ levels: [{ depth: 17, field: `tag:${ROOT}` }] }),
    ).toThrow("depth");
    expect(() =>
      parseEventGrouping({ levels: [{ depth: 0, field: `tag:${ROOT}` }] }),
    ).toThrow("depth");
  });
});
