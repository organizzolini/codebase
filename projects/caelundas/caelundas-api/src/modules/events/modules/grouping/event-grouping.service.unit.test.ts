import { describe, expect, it } from "vitest";

import { EventFilterParametersService } from "../filters/event-filter-parameters.service";

import { EventGroupingService } from "./event-grouping.service";

import type { EventGroupLevel } from "./event-grouping.types";

const service = new EventGroupingService(new EventFilterParametersService());

const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const MARS = "0199b1a0-0000-7000-8000-000000000001";

/** One level with the optional parts defaulted. */
function level(
  field: string,
  rest: Partial<EventGroupLevel> = {},
): EventGroupLevel {
  return { field, tags: [], ...rest };
}

describe(EventGroupingService, () => {
  describe("compile", () => {
    it("compiles to nothing for no grouping", () => {
      expect.hasAssertions();

      expect(service.compile([], 2)).toStrictEqual({
        parameters: [],
        sql: "",
      });
    });

    it("reads a tag root's children by default, binding after the parameters already bound", () => {
      expect.hasAssertions();

      const compiled = service.compile([level(`tag:${ROOT}`)], 2);

      expect(compiled.parameters).toStrictEqual([ROOT, 1]);
      expect(compiled.sql).toContain("t.tag_root_id::text = $3");
      expect(compiled.sql).toContain("t.tag_depth = $4::bigint");
      expect(compiled.sql).toContain("as group_0");
    });

    it("goes down to the depth asked for", () => {
      expect.hasAssertions();

      expect(
        service.compile([level(`tag:${ROOT}`, { depth: 3 })], 0).parameters,
      ).toStrictEqual([ROOT, 3]);
    });

    it("groups by the picked tags alone, dropping what is no tag id", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        [level(`tag:${ROOT}`, { tags: [MARS, "not-a-tag"] })],
        0,
      );

      expect(compiled.parameters).toStrictEqual([[MARS]]);
      expect(compiled.sql).toContain("t.tag_id = any($1::uuid[])");
    });

    it("binds no value for a derived level, which reads the event's own columns", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        [level("year"), level("quarter"), level("hour")],
        0,
      );

      expect(compiled.parameters).toStrictEqual([]);
      expect(compiled.sql).toContain("substr(e.start_local_day, 1, 4)");
      expect(compiled.sql).toContain("'-Q'");
      expect(compiled.sql).toContain(
        "right('0' || e.start_local_hour::text, 2)",
      );
    });

    it("writes the Sunday a week starts on and the duration buckets", () => {
      expect.hasAssertions();

      const { sql } = service.compile(
        [level("week"), level("duration"), level("weekday"), level("day")],
        0,
      );

      expect(sql).toContain("extract(dow from e.start_local_day::date)");
      expect(sql).toContain(
        "when e.duration_minutes between 60 and 1439 then 'hours'",
      );
      expect(sql).toContain(`extract(dow from e."start" at time zone`);
      expect(sql).toContain('e.start_local_day as "key"');
    });

    it("numbers one column per level, group_0 onward", () => {
      expect.hasAssertions();

      const { sql } = service.compile([level("year"), level("month")], 0);

      expect(sql).toContain("as group_0");
      expect(sql).toContain("as group_1");
      expect(sql).not.toContain("as group_2");
    });

    it("answers no group for a field the calendar does not know", () => {
      expect.hasAssertions();

      const compiled = service.compile([level("nonsense")], 0);

      expect(compiled.parameters).toStrictEqual([]);
      expect(compiled.sql).toContain("where false");
    });
  });

  describe("parse", () => {
    it("answers no levels for no grouping and no color", () => {
      expect.hasAssertions();

      expect(service.parse(null)).toStrictEqual([]);
      expect(service.parse(undefined)).toStrictEqual([]);
    });

    it("fills the optional parts and puts the color level after the grouping", () => {
      expect.hasAssertions();

      expect(
        service.parse({
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
        service.parse({ colorBy: { field: "hour" }, levels: three }),
      ).toHaveLength(4);
      expect(() =>
        service.parse({ levels: [...three, { field: "hour" }] }),
      ).toThrow("too_big");
    });

    it("refuses a depth beyond the deepest a grouping may reach", () => {
      expect.hasAssertions();

      expect(() =>
        service.parse({ levels: [{ depth: 17, field: `tag:${ROOT}` }] }),
      ).toThrow("depth");
      expect(() =>
        service.parse({ levels: [{ depth: 0, field: `tag:${ROOT}` }] }),
      ).toThrow("depth");
    });
  });
});
