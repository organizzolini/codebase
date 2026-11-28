import { describe, expect, it } from "vitest";

import {
  fieldRule,
  filterGroup,
  tagRule,
} from "../../../../../../testing/event-filters";

import { toEventFilterInput } from "./event-filter-input.utilities";

describe(toEventFilterInput, () => {
  it("writes nothing for an empty tree or none", () => {
    expect(toEventFilterInput(filterGroup("and"))).toBeNull();
    expect(toEventFilterInput(undefined)).toBeNull();
  });

  it("writes a group's rules with the combinator in capitals and values as text", () => {
    expect(
      toEventFilterInput(
        filterGroup(
          "or",
          tagRule("body", "is_any_of", ["mars"]),
          fieldRule("hour", "between", [22, 23]),
          fieldRule("duration-minutes", "gt", 90),
          fieldRule("text", "contains", "ingress"),
        ),
      ),
    ).toStrictEqual({
      combinator: "OR",
      rules: [
        {
          operator: "is_any_of",
          path: ["tag:tag-body"],
          values: ["tag-mars"],
        },
        { operator: "between", path: ["hour"], values: ["22", "23"] },
        { operator: "gt", path: ["duration-minutes"], values: ["90"] },
        { operator: "contains", path: ["text"], values: ["ingress"] },
      ],
    });
  });

  it("splits nested groups from rules and keeps a negation", () => {
    expect(
      toEventFilterInput(
        filterGroup(
          "and",
          filterGroup("or", tagRule("body", "is_any_of", ["sun"])),
          { ...tagRule("aspect", "is_any_of", ["simple"]), negated: true },
        ),
      ),
    ).toStrictEqual({
      combinator: "AND",
      groups: [
        {
          combinator: "OR",
          rules: [
            {
              operator: "is_any_of",
              path: ["tag:tag-body"],
              values: ["tag-sun"],
            },
          ],
        },
      ],
      rules: [
        {
          negated: true,
          operator: "is_any_of",
          path: ["tag:tag-aspect"],
          values: ["tag-simple"],
        },
      ],
    });
  });

  it("leaves out the rules that are not finished, and the groups they empty", () => {
    const unfinished = filterGroup(
      "and",
      fieldRule("tag:tag-body", "", ["tag-mars"]),
      fieldRule("tag:tag-body", "is_any_of", []),
      fieldRule("tag:tag-body", "is_any_of", undefined),
      fieldRule("tag:tag-body", "is_any_of", [null]),
      fieldRule("hour", "between", [22, null]),
      fieldRule("text", "contains", ""),
      filterGroup("or"),
    );

    expect(toEventFilterInput(unfinished)).toBeNull();
    expect(
      toEventFilterInput(
        filterGroup(
          "or",
          fieldRule("tag:tag-body", "is_any_of", []),
          tagRule("body", "is_any_of", ["saturn"]),
        ),
      ),
    ).toStrictEqual({
      combinator: "OR",
      rules: [
        {
          operator: "is_any_of",
          path: ["tag:tag-body"],
          values: ["tag-saturn"],
        },
      ],
    });
  });

  it("writes a lone rule as a group of one", () => {
    expect(
      toEventFilterInput(tagRule("body", "is_none_of", ["moon"])),
    ).toStrictEqual({
      combinator: "AND",
      rules: [
        {
          operator: "is_none_of",
          path: ["tag:tag-body"],
          values: ["tag-moon"],
        },
      ],
    });
  });

  it("writes a group that holds only nested groups with no rules of its own", () => {
    expect(
      toEventFilterInput(
        filterGroup(
          "or",
          filterGroup("and", tagRule("body", "is_any_of", ["sun"])),
        ),
      ),
    ).toStrictEqual({
      combinator: "OR",
      groups: [
        {
          combinator: "AND",
          rules: [
            {
              operator: "is_any_of",
              path: ["tag:tag-body"],
              values: ["tag-sun"],
            },
          ],
        },
      ],
    });
  });
});
