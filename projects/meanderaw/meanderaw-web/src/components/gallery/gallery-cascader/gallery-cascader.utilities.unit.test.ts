import { describe, expect, it } from "vitest";

import {
  createFieldNodes,
  humanizeCategory,
} from "./gallery-cascader.utilities";

import type { PickerField } from "./gallery-cascader.types";

const FIELD = { description: "d", label: "L" };
const FIELDS: PickerField[] = [
  { ...FIELD, category: "submatrix", key: "isChain" },
  { ...FIELD, category: "shape", key: "rows" },
  { ...FIELD, category: "path", key: "junctionCount" },
  { ...FIELD, category: "shape", key: "columns" },
];

describe("gallery cascader utilities", () => {
  describe(createFieldNodes, () => {
    it("builds a branch per category, shape first then by name, each holding its fields in order", () => {
      const nodes = createFieldNodes(FIELDS);

      expect(nodes.map(({ label, value }) => [value, label])).toStrictEqual([
        ["category:shape", "Shape"],
        ["category:path", "Path"],
        ["category:submatrix", "Submatrix"],
      ]);
      expect(nodes[0]?.children?.map(({ value }) => value)).toStrictEqual([
        "rows",
        "columns",
      ]);
    });

    it("describes a leaf, and lets its key and label be searched", () => {
      expect(createFieldNodes(FIELDS)[1]?.children?.[0]).toStrictEqual({
        description: "d",
        keywords: ["junctionCount", "L"],
        label: "L",
        value: "junctionCount",
      });
    });
  });

  describe(humanizeCategory, () => {
    it("raises the first letter and spaces dashes and underscores", () => {
      expect(humanizeCategory("shape")).toBe("Shape");
      expect(humanizeCategory("path-and_loop")).toBe("Path and loop");
    });
  });
});
