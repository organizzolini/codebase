import { describe, expect, it } from "vitest";

import { createEventFilterFields } from "../event-filter-model/event-filter-fields.utilities";

import { TAG_PARENT_VALUE } from "./filter-cascader.constants";
import {
  createFilterItems,
  isValue,
  toFilterQuery,
  toFilterValue,
} from "./filter-cascader.utilities";

import type { EventFilterQuery } from "../event-filter-model/event-filters.types";

const FIELDS = createEventFilterFields([
  {
    id: "type",
    name: "Type",
    values: [
      { count: 2, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      {
        count: 1,
        depth: 2,
        id: "major",
        name: "Major Aspect",
        path: "Aspect / Major Aspect",
      },
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
    ],
  },
]);
/** Venus under two parents, and a header the Filter menu leaves out. */
const SHARED_FIELDS = createEventFilterFields([
  {
    id: "body",
    name: "Body",
    values: [
      {
        count: 3,
        depth: 1,
        id: "planet",
        isFilterable: false,
        name: "Planet",
        path: "Planet",
      },
      {
        count: 2,
        depth: 2,
        id: "personal",
        name: "Personal",
        path: "Planet / Personal",
      },
      {
        alsoUnder: ["Planet / Benefic"],
        count: 1,
        depth: 3,
        id: "venus",
        name: "Venus",
        path: "Planet / Personal / Venus",
      },
      {
        count: 1,
        depth: 2,
        id: "benefic",
        name: "Benefic",
        path: "Planet / Benefic",
      },
      {
        alsoUnder: ["Planet / Personal"],
        count: 1,
        depth: 3,
        id: "venus",
        name: "Venus",
        path: "Planet / Benefic / Venus",
      },
    ],
  },
]);
const EMPTY: EventFilterQuery = {
  combinator: "or",
  id: "filter",
  rules: [],
  type: "group",
};
const TEXT_RULE = {
  id: "text-rule",
  operator: "contains",
  path: ["text"],
  type: "rule" as const,
  value: "ingress",
};

describe("filter-cascader utilities", () => {
  describe(isValue, () => {
    it("takes a value as one to tick, and an attribute as one that only opens", () => {
      const [tag] = createFilterItems(FIELDS);
      const type = tag?.children?.[0];

      expect(type === undefined ? true : isValue(type)).toBe(false);
      expect(tag === undefined ? true : isValue(tag)).toBe(false);
      expect(isValue({ label: "Aspect", value: "tag:type|aspect" })).toBe(true);
    });
  });

  describe("a tag under several parents", () => {
    const rows = (): string[] => {
      const body = createFilterItems(SHARED_FIELDS)[0]?.children?.[0];
      const values: string[] = [];
      const pending = [...(body?.children ?? [])];

      for (
        let node = pending.shift();
        node !== undefined;
        node = pending.shift()
      ) {
        values.push(node.value);
        pending.unshift(...(node.children ?? []));
      }

      return values;
    };

    it("is a row under each parent, each with a value of its own and the other parents in its description", () => {
      const body = createFilterItems(SHARED_FIELDS)[0]?.children?.[0];
      const benefic = body?.children?.[0]?.children?.[1];

      expect(rows().filter((value) => value.includes("venus"))).toStrictEqual([
        "tag:body|venus@@Planet / Personal / Venus",
        "tag:body|venus@@Planet / Benefic / Venus",
      ]);
      expect(benefic?.label).toBe("Benefic");
      expect(benefic?.children?.[0]?.description).toContain("also Personal");
    });

    it("ticks every row of a picked tag, and keeps one rule value for it", () => {
      const query: EventFilterQuery = {
        ...EMPTY,
        rules: [
          {
            id: "body-rule",
            operator: "is_any_of",
            path: ["tag:body"],
            type: "rule",
            value: ["venus", "gone"],
          },
        ],
      };

      expect(toFilterValue(SHARED_FIELDS, query)).toStrictEqual([
        "tag:body|venus@@Planet / Personal / Venus",
        "tag:body|venus@@Planet / Benefic / Venus",
        "tag:body|gone",
      ]);
    });

    it("lists a header the menu leaves out as a folder that cannot be ticked", () => {
      const planet =
        createFilterItems(SHARED_FIELDS)[0]?.children?.[0]?.children?.[0];

      expect(planet === undefined ? true : isValue(planet)).toBe(false);
    });
  });

  describe(createFilterItems, () => {
    it("lists the attributes that pick among values, with tags nested beneath their root", () => {
      const items = createFilterItems(FIELDS);
      const labels = items.map((item) => item.label);
      const tag = items[0];
      const type = tag?.children?.find((item) => item.label === "Type");

      expect(tag?.label).toBe("Tag");
      expect(tag?.value).toBe(TAG_PARENT_VALUE);
      expect(tag?.children?.map((child) => child.label)).toStrictEqual([
        "Type",
      ]);
      expect(labels).not.toContain("Type");
      expect(labels).toContain("Weekday");
      expect(labels).not.toContain("Text");
      expect(labels).not.toContain("Date");
      expect(type?.children?.map((child) => child.label)).toStrictEqual([
        "Aspect",
        "Ingress",
      ]);
      expect(type?.children?.[0]?.children?.[0]?.label).toBe("Major Aspect");
    });

    it("keeps one attribute's values apart from another's by naming their field", () => {
      const items = createFilterItems(FIELDS);
      const values = items.flatMap((item) =>
        (item.children ?? []).flatMap((child) =>
          child.value.startsWith("field|") ? (child.children ?? []) : [child],
        ),
      );

      expect(new Set(values.map((value) => value.value)).size).toBe(
        values.length,
      );
    });
  });

  describe(toFilterValue, () => {
    it("ticks the values of a rule picking among a field's values, and nothing else", () => {
      const value = toFilterValue(FIELDS, {
        ...EMPTY,
        rules: [
          {
            id: "type-rule",
            operator: "is_any_of",
            path: ["tag:type"],
            type: "rule",
            value: ["aspect", "major"],
          },
          TEXT_RULE,
        ],
      });

      expect(value).toStrictEqual(["tag:type|aspect", "tag:type|major"]);
    });

    it("ticks nothing for a rule with the other operator or no list", () => {
      expect(
        toFilterValue(FIELDS, {
          ...EMPTY,
          rules: [
            {
              id: "not",
              operator: "is_none_of",
              path: ["tag:type"],
              type: "rule",
              value: ["aspect"],
            },
            {
              id: "bare",
              operator: "is_any_of",
              path: ["tag:type"],
              type: "rule",
              value: "aspect",
            },
          ],
        }),
      ).toStrictEqual([]);
    });
  });

  describe(toFilterQuery, () => {
    it("writes one rule per attribute with values ticked, all of which must hold", () => {
      const query = toFilterQuery(
        ["tag:type|aspect", "tag:type|major", "weekday|1"],
        FIELDS,
        EMPTY,
      );

      expect(query.combinator).toBe("and");
      expect(query.rules).toHaveLength(2);
      expect(query.rules[0]).toMatchObject({
        path: ["tag:type"],
        value: ["aspect", "major"],
      });
      expect(query.rules[1]).toMatchObject({ path: ["weekday"], value: ["1"] });
    });

    it("keeps the rules the list does not edit, and replaces the ones it does", () => {
      const query = toFilterQuery(["tag:type|ingress"], FIELDS, {
        ...EMPTY,
        rules: [
          {
            id: "old",
            operator: "is_any_of",
            path: ["tag:type"],
            type: "rule",
            value: ["aspect"],
          },
          TEXT_RULE,
        ],
      });

      expect(query.rules).toHaveLength(2);
      expect(query.rules[0]).toMatchObject({ id: "text-rule" });
      expect(query.rules[1]).toMatchObject({ value: ["ingress"] });
    });

    it("drops an attribute's rule once none of its values is ticked", () => {
      const query = toFilterQuery([], FIELDS, {
        ...EMPTY,
        rules: [
          {
            id: "old",
            operator: "is_any_of",
            path: ["tag:type"],
            type: "rule",
            value: ["aspect"],
          },
        ],
      });

      expect(query.rules).toStrictEqual([]);
    });
  });
});
