import { describe, expect, it } from "vitest";

import {
  parseGraphDiagram,
  parseGraphFields,
  parseGraphFilter,
  parseGraphSort,
} from "./render-options.utilities";

describe("graph options utilities", () => {
  describe(parseGraphDiagram, () => {
    it.each([
      [undefined, "flowchart"],
      ["flowchart", "flowchart"],
      ["filetree", "filetree"],
    ] as const)("reads %j as the %s diagram", (value, diagram) => {
      expect(parseGraphDiagram(value)).toBe(diagram);
    });

    it.each(["tree", "Filetree", "", "flowchart "])(
      "rejects %j, listing the choices",
      (value) => {
        expect(() => parseGraphDiagram(value)).toThrow(
          `--diagram must be flowchart or filetree, e.g. --diagram filetree; got "${value}"`,
        );
      },
    );
  });

  describe(parseGraphFilter, () => {
    it.each([
      ["name=Inbox", "name", "=", "Inbox"],
      ["name!=Inbox", "name", "!=", "Inbox"],
      ["name~=box", "name", "~=", "box"],
      ["id<4", "id", "<", "4"],
      ["id>4", "id", ">", "4"],
    ])(
      "parses %s as column, operator, and value",
      (expression, column, operator, value) => {
        expect(parseGraphFilter(expression)).toStrictEqual({
          column,
          expression,
          operator,
          value,
        });
      },
    );

    it("keeps everything after the operator as the value, equals signs included", () => {
      expect(parseGraphFilter("name==a=b").value).toBe("=a=b");
      expect(parseGraphFilter("name=").value).toBe("");
    });

    it.each([
      "name",
      "name ~ box",
      "name~~box",
      "=Inbox",
      "1name=x",
      "name:asc",
      "",
    ])("rejects %j, which is not column<op>value", (expression) => {
      expect(() => parseGraphFilter(expression)).toThrow(
        `--filter "${expression}" must be column<op>value, e.g. --filter name~=Inbox; operators are =, !=, ~= (contains), <, >`,
      );
    });
  });

  describe(parseGraphSort, () => {
    it.each([
      ["name", "name", "asc"],
      ["name:asc", "name", "asc"],
      ["id:desc", "id", "desc"],
    ])(
      "parses %s as column and direction, ascending by default",
      (expression, column, direction) => {
        expect(parseGraphSort(expression)).toStrictEqual({
          column,
          direction,
          expression,
        });
      },
    );

    it.each(["name:up", "name:", ":asc", "name desc", ""])(
      "rejects %j, which is not column with an optional :asc or :desc",
      (expression) => {
        expect(() => parseGraphSort(expression)).toThrow(
          `--sort "${expression}" must be column, column:asc, or column:desc, e.g. --sort name:desc`,
        );
      },
    );
  });

  describe(parseGraphFields, () => {
    it("names icon, note and order when no flag names others", () => {
      expect(parseGraphFields({})).toStrictEqual({
        icon: "icon",
        note: "note",
        order: "order",
      });
    });

    it("takes each field a flag names, trimmed", () => {
      expect(
        parseGraphFields({
          iconField: " glyph ",
          noteField: "description",
          orderField: "position",
        }),
      ).toStrictEqual({
        icon: "glyph",
        note: "description",
        order: "position",
      });
    });

    it("falls back to the default for a blank flag", () => {
      expect(parseGraphFields({ iconField: "  " }).icon).toBe("icon");
    });
  });
});
