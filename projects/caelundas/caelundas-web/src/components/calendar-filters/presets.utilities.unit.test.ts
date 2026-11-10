import { describe, expect, it } from "vitest";

import { toEventFilterInput } from "./event-filter-input.utilities";
import { toPreset } from "./presets.utilities";

describe(toPreset, () => {
  it("reads a preset the API answered as the builder's tree, rules first then groups", () => {
    const preset = toPreset({
      description: "Planets and signs.",
      filter: {
        combinator: "OR",
        groups: [
          {
            combinator: "AND",
            groups: null,
            rules: [
              {
                negated: true,
                operator: "is_none_of",
                path: ["tag:tag-planet"],
                values: ["tag-moon"],
              },
            ],
          },
        ],
        rules: [
          {
            negated: false,
            operator: "is_any_of",
            path: ["tag:tag-type"],
            values: ["tag-ingress"],
          },
        ],
      },
      id: "planet-sign-events",
      name: "Planet-sign events",
    });

    expect(preset).toStrictEqual({
      description: "Planets and signs.",
      filter: {
        combinator: "or",
        id: "planet-sign-events-0",
        rules: [
          {
            id: "planet-sign-events-0-0",
            operator: "is_any_of",
            path: ["tag:tag-type"],
            type: "rule",
            value: ["tag-ingress"],
          },
          {
            combinator: "and",
            id: "planet-sign-events-0-1",
            rules: [
              {
                id: "planet-sign-events-0-1-0",
                negated: true,
                operator: "is_none_of",
                path: ["tag:tag-planet"],
                type: "rule",
                value: ["tag-moon"],
              },
            ],
            type: "group",
          },
        ],
        type: "group",
      },
      id: "planet-sign-events",
      name: "Planet-sign events",
    });
  });

  it("writes back to the input it was read from", () => {
    const filter = {
      combinator: "AND" as const,
      rules: [
        {
          negated: false,
          operator: "is_any_of",
          path: ["tag:tag-type"],
          values: ["tag-ingress"],
        },
      ],
    };

    expect(
      toEventFilterInput(
        toPreset({
          description: "",
          filter: { ...filter, groups: null },
          id: "any",
          name: "Any",
        }).filter,
      ),
    ).toStrictEqual({
      combinator: "AND",
      rules: [
        {
          operator: "is_any_of",
          path: ["tag:tag-type"],
          values: ["tag-ingress"],
        },
      ],
    });
  });

  it("reads a rule with no values as one with none to pick from", () => {
    const { filter } = toPreset({
      description: "",
      filter: {
        combinator: "AND",
        groups: null,
        rules: [
          { negated: null, operator: "eq", path: ["text"], values: null },
        ],
      },
      id: "empty",
      name: "Empty",
    });

    expect(filter.rules).toStrictEqual([
      {
        id: "empty-0-0",
        operator: "eq",
        path: ["text"],
        type: "rule",
        value: [],
      },
    ]);
  });

  it("reads a group that holds only nested groups", () => {
    const { filter } = toPreset({
      description: "",
      filter: {
        combinator: "OR",
        groups: [
          {
            combinator: "AND",
            groups: null,
            rules: [
              {
                negated: false,
                operator: "is_any_of",
                path: ["tag:tag-type"],
                values: ["tag-ingress"],
              },
            ],
          },
        ],
        rules: null,
      },
      id: "nested",
      name: "Nested",
    });

    expect(filter.rules).toHaveLength(1);
    expect(filter.rules[0]).toMatchObject({ id: "nested-0-0", type: "group" });
  });
});
