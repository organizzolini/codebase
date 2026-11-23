import { describe, expect, it } from "vitest";

import {
  createFieldNodes,
  createTrails,
  humanizeCategory,
  locateSubCategory,
  toFieldPath,
} from "./gallery-cascader.utilities";

import type { PickerField } from "./gallery-cascader.types";

const FIELD = { description: "d", label: "L" };
const FIELDS: PickerField[] = [
  { ...FIELD, category: "submatrix", key: "isChain" },
  { ...FIELD, category: "shape", key: "rows" },
  { ...FIELD, category: "path", key: "junctionCount" },
  { ...FIELD, category: "shape", key: "columns" },
];

/** A submatrix catalog big enough to nest: lettered counts and shape nouns. */
function submatrixFields(): PickerField[] {
  const lettered = Array.from({ length: 50 }, (_, index): PickerField => ({
    ...FIELD,
    category: "submatrix",
    key: `a${String(index)}`,
    label: `${index < 25 ? "A" : "Kaf Initial"} Northeast Half ${index % 2 === 0 ? "Latin" : "Arabic"} Count`,
  }));

  return [
    ...lettered,
    { ...FIELD, category: "submatrix", key: "corner", label: "Corner Count" },
    {
      ...FIELD,
      category: "submatrix",
      key: "embedded",
      label: "Embedded U Count",
    },
    { ...FIELD, category: "shape", key: "rows", label: "Rows" },
  ];
}

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

  describe(locateSubCategory, () => {
    it("reads a lettered name as its script then its letter", () => {
      expect(locateSubCategory("A Northeast Half Latin Count")).toStrictEqual([
        "Letter",
        "Latin",
        "A",
      ]);
      expect(
        locateSubCategory("Kaf Initial Southwest Arabic Count"),
      ).toStrictEqual(["Letter", "Arabic", "Kaf Initial"]);
      expect(
        locateSubCategory("Gan Southeast Three Quarter Hanzi Count"),
      ).toStrictEqual(["Letter", "Hanzi", "Gan"]);
    });

    it("reads any other name as the noun it counts", () => {
      expect(locateSubCategory("Corner Count")).toStrictEqual(["Corner"]);
      expect(locateSubCategory("North-East Corner Count")).toStrictEqual([
        "Corner",
      ]);
      expect(locateSubCategory("Longest Horizontal Run Length")).toStrictEqual([
        "Run",
      ]);
      expect(locateSubCategory("Embedded U Count")).toStrictEqual(["Embedded"]);
      expect(locateSubCategory("Density")).toStrictEqual(["Density"]);
    });
  });

  describe(createTrails, () => {
    it("keeps a small submatrix category flat", () => {
      expect(createTrails(FIELDS).get("isChain")).toStrictEqual(["submatrix"]);
    });

    it("nests a large submatrix category by sub-category, and no other", () => {
      const trails = createTrails(submatrixFields());

      expect(trails.get("a0")).toStrictEqual([
        "submatrix",
        "Letter",
        "Latin",
        "A",
      ]);
      expect(trails.get("a49")).toStrictEqual([
        "submatrix",
        "Letter",
        "Arabic",
        "Kaf Initial",
      ]);
      expect(trails.get("corner")).toStrictEqual(["submatrix", "Corner"]);
      expect(trails.get("rows")).toStrictEqual(["shape"]);
    });
  });

  describe(toFieldPath, () => {
    it("names each branch by its trail up to it, then the key", () => {
      expect(
        toFieldPath(["submatrix", "Letter", "Latin", "A"], "a0"),
      ).toStrictEqual([
        "submatrix",
        "submatrix/Letter",
        "submatrix/Letter/Latin",
        "submatrix/Letter/Latin/A",
        "a0",
      ]);
    });
  });

  describe("nested field nodes", () => {
    it("nests the submatrix into branches of sub-categories, each field a leaf under its letter", () => {
      const submatrix = createFieldNodes(submatrixFields()).find(
        ({ value }) => value === "category:submatrix",
      );

      expect(submatrix?.children?.map(({ label }) => label)).toStrictEqual([
        "Corner",
        "Embedded",
        "Letter",
      ]);

      const letter = submatrix?.children?.find(
        ({ label }) => label === "Letter",
      );

      expect(letter?.children?.map(({ label }) => label)).toStrictEqual([
        "Arabic",
        "Latin",
      ]);

      const latin = letter?.children?.find(({ label }) => label === "Latin");

      expect(latin?.value).toBe("category:submatrix/Letter/Latin");
      expect(latin?.children?.map(({ label }) => label)).toStrictEqual([
        "A",
        "Kaf Initial",
      ]);
      expect(latin?.children?.[0]?.children).toHaveLength(13);
    });
  });

  describe(humanizeCategory, () => {
    it("raises the first letter and spaces dashes and underscores", () => {
      expect(humanizeCategory("shape")).toBe("Shape");
      expect(humanizeCategory("path-and_loop")).toBe("Path and loop");
    });
  });
});
