import { describe, expect, it } from "vitest";

import { EventFilterCalendarFieldsService } from "./event-filter-calendar-fields.service";
import { EventFilterNumbersService } from "./event-filter-numbers.service";
import { EventFilterParametersService } from "./event-filter-parameters.service";
import { EventFilterValuesService } from "./event-filter-values.service";
import { EventFilterService } from "./event-filter.service";

import type { EventFilterGroup, EventFilterRule } from "./event-filter.types";

const parameters = new EventFilterParametersService();
const values = new EventFilterValuesService();
const service = new EventFilterService(
  new EventFilterCalendarFieldsService(parameters, values),
  new EventFilterNumbersService(parameters, values),
  parameters,
  values,
);

const MARS = "0199b1a0-0000-7000-8000-000000000001";
const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const TAG_PATH = `tag:${ROOT}`;

/** Compiles one rule alone under an `and`, binding after two parameters. */
function compile(
  single: EventFilterRule,
): ReturnType<EventFilterService["compile"]> {
  return service.compile(group("and", [single]), 2);
}

/** A group of rules, and groups when given. */
function group(
  combinator: "and" | "or",
  rules: EventFilterRule[],
  groups: EventFilterGroup[] = [],
): EventFilterGroup {
  return { combinator, groups, rules };
}

/** One finished-or-not rule, with the optional parts defaulted. */
function rule(
  path: string,
  operator: string,
  values: string[] = [],
  negated = false,
): EventFilterRule {
  return { negated, operator, path: [path], values };
}

describe(EventFilterService, () => {
  describe("compile", () => {
    it("compiles to nothing for no filter or an empty one", () => {
      expect.hasAssertions();

      expect(service.compile(undefined, 0)).toBeNull();
      expect(service.compile(null, 0)).toBeNull();
      expect(service.compile(group("and", []), 0)).toBeNull();
      expect(
        service.compile(group("or", [], [group("and", [])]), 0),
      ).toBeNull();
    });

    it("numbers its placeholders after the parameters already bound", () => {
      expect.hasAssertions();

      expect(compile(rule(TAG_PATH, "is_any_of", [MARS]))).toStrictEqual({
        parameters: [[MARS]],
        sql: expect.stringContaining("= any($3::uuid[])"),
      });
    });

    it("joins rules and nested groups under each group's combinator", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        group(
          "or",
          [rule("hour", "between", ["1", "2"])],
          [group("and", [rule("weekday", "is_any_of", ["1"])])],
        ),
        0,
      );

      expect(compiled?.parameters).toStrictEqual([1, 2, [1]]);
      expect(compiled?.sql).toMatch(
        /^\(\(.*between \$1::integer and \$2::integer\) or \(\(.*= any\(\$3::integer\[\]\)\)\)\)$/u,
      );
    });

    it("leaves out rules that are not finished, and groups left empty", () => {
      expect.hasAssertions();

      const unfinished = [
        rule(TAG_PATH, "is_any_of"),
        rule(TAG_PATH, "contains", [MARS]),
        rule("date", "between", ["2026-03-10"]),
        rule("date", "between", ["2026-03-11", "2026-03-10"]),
        rule("date", "is_any_of", ["2026-03-10", "2026-03-11"]),
        rule("weekday", "is_any_of", ["7"]),
        rule("weekday", "between", ["1"]),
        rule("hour", "between", ["3", "1"]),
        rule("hour", "between", ["0", "24"]),
        rule("hour", "contains", ["1", "2"]),
        rule("duration", "is_any_of", ["fortnights"]),
        rule("duration", "between", ["days"]),
        rule("temporality", "is_any_of", [""]),
        rule("temporality", "gt", ["Instant"]),
        rule("text", "contains", ["   "]),
        rule("text", "contains", ["a", "b"]),
        rule("text", "is_any_of", ["mars"]),
        rule("duration-minutes", "gt", ["many"]),
        rule("duration-minutes", "between", ["5"]),
        rule(TAG_PATH, "gt", []),
        rule(TAG_PATH, "between", ["9", "1"]),
        rule("constructor", "is_any_of", ["x"]),
        rule("hour", "constructor", ["1"]),
        rule("nonsense", "eq", ["1"]),
      ];

      for (const single of unfinished) {
        expect(compile(single)).toBeNull();
      }

      expect(
        service.compile(group("and", unfinished, [group("or", unfinished)]), 0),
      ).toBeNull();
    });

    it("keeps the finished rules when others are unfinished", () => {
      expect.hasAssertions();

      expect(
        service.compile(
          group("and", [
            rule("text", "contains", [" "]),
            rule("hour", "gt", ["3"]),
          ]),
          0,
        ),
      ).toStrictEqual({
        parameters: ["3"],
        sql: "((e.start_local_hour > $1::numeric))",
      });
    });

    describe("tags", () => {
      it("matches any, all or none of the picked tags", () => {
        expect.hasAssertions();

        const any = compile(rule(TAG_PATH, "is_any_of", [MARS]));
        const all = compile(rule(TAG_PATH, "has_all_of", [MARS, ROOT]));
        const none = compile(rule(TAG_PATH, "is_none_of", [MARS]));

        expect(any?.sql).toMatch(/\(\(exists \(/u);
        expect(all?.sql).toContain("count(distinct m.tag_id)");
        expect(all?.parameters).toStrictEqual([[MARS, ROOT], 2]);
        expect(none?.sql).toContain("not exists");
      });

      it("keeps a pick that is no tag id out of the cast but in the count", () => {
        expect.hasAssertions();

        expect(
          compile(rule(TAG_PATH, "has_all_of", [MARS, "not-a-uuid"]))
            ?.parameters,
        ).toStrictEqual([[MARS], 2]);
      });

      it("flips a negated rule", () => {
        expect.hasAssertions();

        expect(
          compile(rule(TAG_PATH, "is_any_of", [MARS], true))?.sql,
        ).toContain("(not (exists");
      });

      it("compares the numbers its tags are named for", () => {
        expect.hasAssertions();

        const gte = compile(rule(TAG_PATH, "gte", ["6"]));
        const range = compile(rule(TAG_PATH, "between", ["2", "6"]));
        const neq = compile(rule(TAG_PATH, "neq", ["6"]));

        expect(gte?.parameters).toStrictEqual(["6", ROOT]);
        expect(gte?.sql).toContain(">= $3::numeric");
        expect(range?.parameters).toStrictEqual(["2", "6", ROOT]);
        expect(range?.sql).toContain("between $3::numeric and $4::numeric");
        expect(neq?.sql).toContain("(not exists");
      });

      it("flips a range that is not between", () => {
        expect.hasAssertions();

        expect(
          compile(rule(TAG_PATH, "not_between", ["2", "6"]))?.sql,
        ).toContain("(not exists");
      });
    });

    describe("derived fields", () => {
      it("reads the local days an event overlaps", () => {
        expect.hasAssertions();

        const between = compile(
          rule("date", "between", ["2026-03-10", "2026-03-12"]),
        );
        const outside = compile(
          rule("date", "not_between", ["2026-03-10", "2026-03-12"]),
        );

        expect(between?.parameters).toStrictEqual(["2026-03-10", "2026-03-12"]);
        expect(between?.sql).toContain("e.start_local_day <= $4::text");
        expect(outside?.sql).toContain("(not (");
      });

      it("picks weekdays, whether as numbers or texts, once each", () => {
        expect.hasAssertions();

        expect(
          compile(rule("weekday", "is_any_of", ["1", "1", "3", "9", ""]))
            ?.parameters,
        ).toStrictEqual([[1, 3]]);
        expect(compile(rule("weekday", "is_none_of", ["0"]))?.sql).toContain(
          "(not (",
        );
      });

      it("compares the local hour, as a range or an ordering", () => {
        expect.hasAssertions();

        expect(
          compile(rule("hour", "not_between", ["9", "17"]))?.sql,
        ).toContain("(not (e.start_local_hour between");
        expect(compile(rule("hour", "lt", ["9"]))?.sql).toBe(
          "((e.start_local_hour < $3::numeric))",
        );
        expect(compile(rule("hour", "neq", ["9"]))?.sql).toBe(
          "((not (e.start_local_hour = $3::numeric)))",
        );
      });

      it("keeps the events whose duration falls in the picked buckets", () => {
        expect.hasAssertions();

        const any = compile(
          rule("duration", "is_any_of", ["instant", "hours"]),
        );
        const none = compile(rule("duration", "is_none_of", ["months"]));

        expect(any?.parameters).toStrictEqual([0, 0, 60, 1439]);
        expect(any?.sql).toContain(" or ");
        expect(none?.parameters).toStrictEqual([
          43_200,
          Number.MAX_SAFE_INTEGER,
        ]);
        expect(none?.sql).toContain("(not (");
      });

      it("compares the duration in minutes", () => {
        expect.hasAssertions();

        expect(compile(rule("duration-minutes", "gt", ["90"]))?.sql).toContain(
          "e.duration_minutes > $3::numeric",
        );
        expect(
          compile(rule("duration-minutes", "not_between", ["1", "5"]))
            ?.parameters,
        ).toStrictEqual(["1", "5"]);
      });

      it("picks temporalities", () => {
        expect.hasAssertions();

        expect(
          compile(rule("temporality", "is_any_of", ["Instant", "Instant"]))
            ?.parameters,
        ).toStrictEqual([["Instant"]]);
      });

      it("matches text literally in either column, ignoring case", () => {
        expect.hasAssertions();

        const contains = compile(rule("text", "contains", ["50%_off\\"]));
        const without = compile(rule("text", "not_contains", ["mars"]));

        expect(contains?.parameters).toStrictEqual([String.raw`%50\%\_off\\%`]);
        expect(contains?.sql).toContain("like lower($3::text)");
        expect(without?.sql).toContain("(not (");
      });

      it("flips a negated rule", () => {
        expect.hasAssertions();

        expect(
          compile(rule("text", "contains", ["mars"], true))?.sql,
        ).toContain("((not (");
      });
    });
  });

  describe("parse", () => {
    it("answers null for no filter", () => {
      expect.hasAssertions();

      expect(service.parse(undefined)).toBeNull();
      expect(service.parse(null)).toBeNull();
    });

    it("fills the lists, values and negation a request left out", () => {
      expect.hasAssertions();

      expect(
        service.parse({
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
        service.parse({
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
        service.parse({
          combinator: "and",
          groups: [{ combinator: "xor", rules: [] }],
        }),
      ).toThrow(/combinator/u);
    });

    it("rejects a rule with no operator", () => {
      expect.hasAssertions();

      expect(() =>
        service.parse({
          combinator: "and",
          rules: [{ path: ["text"], values: ["mars"] }],
        }),
      ).toThrow(/operator/u);
    });
  });
});
