import { describe, expect, it } from "vitest";

import {
  assertGraphColumnNames,
  filterClause,
  graphColumnKind,
  resolveGraphView,
  sortClause,
} from "./render-options-columns.utilities";
import { RenderOptionsError } from "./render-options.constants";
import { parseGraphFilter, parseGraphSort } from "./render-options.utilities";

import type { GraphColumn, GraphPredicate } from "./render-options.types";

const ID_COLUMN: GraphColumn = {
  kind: "number",
  name: "id",
  sqlName: '"id"',
};
const NAME_COLUMN: GraphColumn = {
  kind: "text",
  name: "name",
  sqlName: '"name"',
};
const CREATED_COLUMN: GraphColumn = {
  kind: "date",
  name: "createdOn",
  sqlName: '"created_on"',
};
const COLUMNS: readonly GraphColumn[] = [
  ID_COLUMN,
  NAME_COLUMN,
  CREATED_COLUMN,
];

describe("graph options columns utilities", () => {
  describe(graphColumnKind, () => {
    it.each([
      ["integer", "number"],
      ["bigint", "number"],
      ["smallint", "number"],
      ["numeric", "number"],
      ["double precision", "number"],
      ["real", "number"],
      ["date", "date"],
      ["timestamp without time zone", "date"],
      ["timestamp with time zone", "date"],
      ["time without time zone", "date"],
      ["text", "text"],
      ["character varying", "text"],
      ["interval", "text"],
    ])("classes the %s column as %s", (sqlType, kind) => {
      expect(graphColumnKind(sqlType)).toBe(kind);
    });
  });

  describe(assertGraphColumnNames, () => {
    it("passes when every filtered and sorted column exists", () => {
      expect(() =>
        assertGraphColumnNames(
          ["id", "name"],
          [parseGraphFilter("name=Inbox")],
          [parseGraphSort("id:desc")],
        ),
      ).not.toThrow();
    });

    it("names the unknown filter column and the columns the entity has", () => {
      expect(() =>
        assertGraphColumnNames(
          ["id", "name"],
          [parseGraphFilter("gadget=1")],
          [],
        ),
      ).toThrow(
        new RenderOptionsError(
          '--filter "gadget=1" names no column "gadget"; columns are id, name',
        ),
      );
    });

    it("names the unknown sort column", () => {
      expect(() =>
        assertGraphColumnNames(
          ["id", "name"],
          [],
          [parseGraphSort("gadget:desc")],
        ),
      ).toThrow(
        new RenderOptionsError(
          '--sort "gadget:desc" names no column "gadget"; columns are id, name',
        ),
      );
    });
  });

  describe(resolveGraphView, () => {
    it("resolves each filter and sort to its column, keeping the value", () => {
      const view = resolveGraphView(
        COLUMNS,
        [parseGraphFilter("createdOn>2024-01-01"), parseGraphFilter("id<9")],
        [parseGraphSort("name:desc")],
      );

      expect(view).toStrictEqual({
        filters: [
          { column: CREATED_COLUMN, operator: ">", value: "2024-01-01" },
          { column: ID_COLUMN, operator: "<", value: "9" },
        ],
        sorts: [{ column: NAME_COLUMN, direction: "desc" }],
      });
    });

    it("refuses < and > on a text column, naming it", () => {
      expect(() =>
        resolveGraphView(COLUMNS, [parseGraphFilter("name<M")], []),
      ).toThrow(
        '--filter "name<M" compares with < or >, which needs a numeric or date column; "name" is a text column',
      );
    });

    it("refuses a < or > value that is not a number on a numeric column", () => {
      expect(() =>
        resolveGraphView(COLUMNS, [parseGraphFilter("id>abc")], []),
      ).toThrow('--filter "id>abc": "abc" is not a number');
    });

    it("refuses a < or > value that is not a date on a date column", () => {
      expect(() =>
        resolveGraphView(COLUMNS, [parseGraphFilter("createdOn<soon")], []),
      ).toThrow('--filter "createdOn<soon": "soon" is not a date');
    });

    it("refuses a sort on a column the entity lacks, naming the expression", () => {
      expect(() =>
        resolveGraphView(COLUMNS, [], [parseGraphSort("gadget")]),
      ).toThrow(
        '--sort "gadget" names no column "gadget"; columns are id, name, createdOn',
      );
    });

    it("accepts a signed decimal and a leading-point decimal as numeric values", () => {
      expect(() =>
        resolveGraphView(
          COLUMNS,
          [parseGraphFilter("id>-1.5"), parseGraphFilter("id<.5")],
          [],
        ),
      ).not.toThrow();
    });

    it("leaves = and != and ~= values unchecked on any column", () => {
      expect(() =>
        resolveGraphView(
          COLUMNS,
          [parseGraphFilter("id=abc"), parseGraphFilter("createdOn~=x")],
          [],
        ),
      ).not.toThrow();
    });
  });

  describe(filterClause, () => {
    it("binds each value as a parameter and joins the clauses with AND", () => {
      const predicates: GraphPredicate[] = [
        { column: NAME_COLUMN, operator: "=", value: "Inbox" },
        { column: ID_COLUMN, operator: ">", value: "4" },
      ];

      expect(filterClause(predicates)).toStrictEqual({
        parameters: ["Inbox", "4"],
        sql: '(CAST("name" AS text) = $1) AND ("id" > $2)',
      });
    });

    it("compares != so that a NULL column still matches", () => {
      const predicates: GraphPredicate[] = [
        { column: NAME_COLUMN, operator: "!=", value: "Inbox" },
      ];

      expect(filterClause(predicates).sql).toBe(
        '(CAST("name" AS text) IS DISTINCT FROM $1)',
      );
    });

    it("turns ~= into a LIKE on the value, with LIKE wildcards escaped", () => {
      const predicates: GraphPredicate[] = [
        { column: NAME_COLUMN, operator: "~=", value: "50%_\\" },
      ];

      expect(filterClause(predicates)).toStrictEqual({
        parameters: [String.raw`%50\%\_\\%`],
        sql: '(CAST("name" AS text) LIKE $1)',
      });
    });
  });

  describe(sortClause, () => {
    it("orders each key by its column, nulls last, in the order given", () => {
      const view = resolveGraphView(
        COLUMNS,
        [],
        [parseGraphSort("name:desc"), parseGraphSort("id")],
      );

      expect(sortClause(view.sorts)).toBe(
        '"name" DESC NULLS LAST, "id" ASC NULLS LAST',
      );
    });
  });
});
