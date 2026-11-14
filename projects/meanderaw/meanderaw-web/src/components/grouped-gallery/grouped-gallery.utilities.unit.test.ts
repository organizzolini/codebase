import { describe, expect, it } from "vitest";

import { buildGroupedItems } from "./grouped-gallery.utilities";

import type { GroupField } from "../gallery-group-by/gallery-group-by.types";

const FIELDS: GroupField[] = [
  { key: "rowsColumns", label: "Rows × columns", type: "text" },
  { key: "isHardcoded", label: "Hardcoded", type: "boolean" },
  { key: "isChain", label: "Chain", type: "boolean" },
  { key: "junctionCount", label: "Junction count", type: "number" },
];

describe(buildGroupedItems, () => {
  it("lays headers out depth first, each leaf with a stand-in for its cards", () => {
    const items = buildGroupedItems(
      [
        {
          count: 3,
          field: "isChain",
          groups: [
            { count: 3, field: "junctionCount", groups: [], value: "0" },
          ],
          value: "false",
        },
        {
          count: 1,
          field: "isChain",
          groups: [
            { count: 1, field: "junctionCount", groups: [], value: "2" },
          ],
          value: "true",
        },
      ],
      { cards: {}, columns: 2, fields: FIELDS, filter: undefined },
    );

    expect(
      items.map((item) =>
        item.kind === "header" ? `${item.depth}:${item.label}` : item.kind,
      ),
    ).toStrictEqual([
      "0:Chain: Not held",
      "1:Junction count: 0",
      "pending",
      "0:Chain: Held",
      "1:Junction count: 2",
      "pending",
    ]);
  });

  it("words the keys of the shape fields, and selects a leaf by every level and the filter", () => {
    const pending = buildGroupedItems(
      [
        {
          count: 2,
          field: "rowsColumns",
          groups: [
            { count: 2, field: "isHardcoded", groups: [], value: "true" },
          ],
          value: "3x4",
        },
      ],
      {
        cards: {},
        columns: 1,
        fields: FIELDS,
        filter: {
          combinator: "OR",
          rules: [{ field: "rows", numbers: [9], operator: "LT" }],
        },
      },
    )[2];
    const headers = buildGroupedItems(
      [{ count: 2, field: "rowsColumns", groups: [], value: "3x4" }],
      { cards: {}, columns: 1, fields: FIELDS, filter: undefined },
    );

    expect(headers[0]).toMatchObject({ label: "Rows × columns: 3 × 4" });
    expect(pending).toMatchObject({
      kind: "pending",
      leaf: {
        filter: {
          combinator: "AND",
          groups: [{ combinator: "OR" }],
          rules: [
            { field: "rows", numbers: [3], operator: "EQ" },
            { field: "columns", numbers: [4], operator: "EQ" },
            { field: "isHardcoded", flag: true, operator: "IS" },
          ],
        },
      },
    });
  });

  it("shows the cards read in rows, then a failure or the rest still to read", () => {
    const group = {
      count: 3,
      field: "isHardcoded",
      groups: [],
      value: "false",
    };
    const meanders = [1, 2, 3].map((id) => ({ id: String(id) }) as never);
    const context = { columns: 2, fields: FIELDS, filter: undefined };

    const reading = buildGroupedItems([group], {
      ...context,
      cards: {
        "/isHardcoded=false": {
          endCursor: "2",
          error: undefined,
          hasMore: true,
          meanders,
        },
      },
    });
    const failed = buildGroupedItems([group], {
      ...context,
      cards: {
        "/isHardcoded=false": {
          endCursor: "2",
          error: new Error("down"),
          hasMore: true,
          meanders,
        },
      },
    });
    const done = buildGroupedItems([group], {
      ...context,
      cards: {
        "/isHardcoded=false": {
          endCursor: null,
          error: undefined,
          hasMore: false,
          meanders,
        },
      },
    });

    expect(reading.map(({ kind }) => kind)).toStrictEqual([
      "header",
      "cards",
      "cards",
      "pending",
    ]);
    expect(failed.at(-1)?.kind).toBe("error");
    expect(done.map(({ kind }) => kind)).toStrictEqual([
      "header",
      "cards",
      "cards",
    ]);
    expect(reading[0]).toMatchObject({ label: "Hardcoded: No" });
  });

  it("splices an AND filter into the leaf's own rules, and nests any other whole", () => {
    const group = { count: 1, field: "isHardcoded", groups: [], value: "true" };
    const inner = { combinator: "OR" as const, rules: [] };
    const base = { cards: {}, columns: 1, fields: FIELDS };
    const spliced = buildGroupedItems([group], {
      ...base,
      filter: {
        combinator: "AND",
        groups: [inner],
        rules: [{ field: "rows", numbers: [9], operator: "LT" }],
      },
    }).at(1);
    const nested = buildGroupedItems([group], {
      ...base,
      filter: { combinator: "OR", groups: [inner], rules: [] },
    }).at(1);

    expect(spliced).toMatchObject({
      leaf: {
        filter: {
          groups: [inner],
          rules: [
            { field: "isHardcoded", operator: "IS" },
            { field: "rows", operator: "LT" },
          ],
        },
      },
    });
    expect(nested).toMatchObject({
      leaf: {
        filter: {
          groups: [{ combinator: "OR" }],
          rules: [{ field: "isHardcoded", operator: "IS" }],
        },
      },
    });
  });
});
