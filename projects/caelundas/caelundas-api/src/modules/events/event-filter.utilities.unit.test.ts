import { describe, expect, it } from "vitest";

import { parseEventFilter } from "./event-filter.utilities";

describe(parseEventFilter, () => {
  it("answers null for no filter", () => {
    expect.hasAssertions();

    expect(parseEventFilter(undefined)).toBeNull();
    expect(parseEventFilter(null)).toBeNull();
  });

  it("fills the lists, values and negation a request left out", () => {
    expect.hasAssertions();

    expect(
      parseEventFilter({
        combinator: "or",
        rules: [{ operator: "contains", path: ["text"] }],
      }),
    ).toStrictEqual({
      combinator: "or",
      groups: [],
      rules: [
        { negated: false, operator: "contains", path: ["text"], values: [] },
      ],
    });
  });

  it("validates the groups nested in a group", () => {
    expect.hasAssertions();

    expect(
      parseEventFilter({
        combinator: "and",
        groups: [
          {
            combinator: "or",
            groups: null,
            rules: [
              {
                negated: true,
                operator: "is_any_of",
                path: ["weekday"],
                values: ["1", "2"],
              },
            ],
          },
        ],
        rules: null,
      }),
    ).toStrictEqual({
      combinator: "and",
      groups: [
        {
          combinator: "or",
          groups: [],
          rules: [
            {
              negated: true,
              operator: "is_any_of",
              path: ["weekday"],
              values: ["1", "2"],
            },
          ],
        },
      ],
      rules: [],
    });
  });

  it("rejects an unknown combinator, even one nested deeply", () => {
    expect.hasAssertions();

    expect(() =>
      parseEventFilter({
        combinator: "and",
        groups: [{ combinator: "xor", rules: [] }],
      }),
    ).toThrow(/combinator/u);
  });

  it("rejects a rule with no operator", () => {
    expect.hasAssertions();

    expect(() =>
      parseEventFilter({
        combinator: "and",
        rules: [{ path: ["text"], values: ["mars"] }],
      }),
    ).toThrow(/operator/u);
  });
});
