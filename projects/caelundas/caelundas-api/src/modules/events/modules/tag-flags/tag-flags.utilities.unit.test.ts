import { describe, expect, it } from "vitest";

import { EventFilterCombinator } from "../filtering/modules/rules/event-filter-combinator.entities";

import {
  keepLevel,
  sanitizeFilter,
  sanitizeLevels,
} from "./tag-flags.utilities";

import type { EventFilterGroupEntity } from "../filtering/modules/rules/event-filter.entities";

const BLOCKED = new Set(["header"]);
const RULE = {
  operator: "is_any_of",
  path: ["tag:root"],
  values: ["header", "leaf"],
};

describe("tag flags", () => {
  describe(sanitizeFilter, () => {
    it("drops a blocked tag from a rule and keeps the rest", () => {
      const filter: EventFilterGroupEntity = {
        combinator: EventFilterCombinator.AND,
        rules: [RULE],
      };

      expect(sanitizeFilter(filter, BLOCKED)?.rules).toStrictEqual([
        { ...RULE, values: ["leaf"] },
      ]);
    });

    it("drops a rule left with none of its values, in nested groups too", () => {
      const filter: EventFilterGroupEntity = {
        combinator: EventFilterCombinator.OR,
        groups: [
          {
            combinator: EventFilterCombinator.AND,
            rules: [{ ...RULE, values: ["header"] }],
          },
        ],
        rules: [{ ...RULE, values: ["header"] }],
      };
      const clean = sanitizeFilter(filter, BLOCKED);

      expect(clean?.rules).toStrictEqual([]);
      expect(clean?.groups?.[0]?.rules).toStrictEqual([]);
    });

    it("leaves other fields, rules with no values and an unblocked filter alone", () => {
      const date = { operator: "between", path: ["date"], values: ["header"] };
      const empty = { operator: "is_any_of", path: ["tag:root"], values: [] };
      const filter: EventFilterGroupEntity = {
        combinator: EventFilterCombinator.AND,
        rules: [date, empty],
      };

      expect(sanitizeFilter(filter, BLOCKED)?.rules).toStrictEqual([
        date,
        empty,
      ]);
      expect(sanitizeFilter(filter, new Set())).toBe(filter);
      expect(sanitizeFilter(null, BLOCKED)).toBeNull();
      expect(sanitizeFilter(undefined, BLOCKED)).toBeUndefined();
    });
  });

  describe(keepLevel, () => {
    it("drops a level whose parent or root is blocked", () => {
      expect(
        keepLevel({ field: "tag:root", parent: "header" }, BLOCKED),
      ).toBeUndefined();
      expect(keepLevel({ field: "tag:header" }, BLOCKED)).toBeUndefined();
      expect(keepLevel(null, BLOCKED)).toBeUndefined();
    });

    it("drops a blocked tag from a level's picks, and the level when none is left", () => {
      expect(
        keepLevel({ field: "tag:root", tags: ["header", "leaf"] }, BLOCKED),
      ).toStrictEqual({ field: "tag:root", tags: ["leaf"] });
      expect(
        keepLevel({ field: "tag:root", tags: ["header"] }, BLOCKED),
      ).toBeUndefined();
    });

    it("keeps a level that names no blocked tag, and a calendar field", () => {
      const level = { field: "tag:root", parent: "leaf" };

      expect(keepLevel(level, BLOCKED)).toBe(level);
      expect(keepLevel({ field: "day" }, BLOCKED)).toStrictEqual({
        field: "day",
      });
    });
  });

  describe(sanitizeLevels, () => {
    it("drops the levels that name a blocked tag and keeps the others in order", () => {
      expect(
        sanitizeLevels(
          [
            { field: "day" },
            { field: "tag:root", parent: "header" },
            { field: "tag:root" },
          ],
          BLOCKED,
        ),
      ).toStrictEqual([{ field: "day" }, { field: "tag:root" }]);
    });

    it("passes none, or nothing blocked, through", () => {
      expect(sanitizeLevels(null, BLOCKED)).toBeNull();
      expect(sanitizeLevels(undefined, BLOCKED)).toBeUndefined();
      expect(sanitizeLevels([{ field: "day" }], new Set())).toStrictEqual([
        { field: "day" },
      ]);
    });
  });
});
