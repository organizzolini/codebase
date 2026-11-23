// cspell:ignore Capitula Xxii Iii Liber Primus Praefatio Carmina Urbe Condita
import { describe, expect, it } from "vitest";

import { numberedOf, splitLevel } from "./library-text-tree.utilities";

import type { LibraryTextRow } from "../library-grid/library-grid.types";

/** A Text row with a title and, optionally, children. */
function row(title: string, childCount = 0): LibraryTextRow {
  return {
    childCount,
    matches: [],
    text: {
      collection: null,
      edition: null,
      editors: null,
      findSpot: null,
      id: title,
      inscriptionType: null,
      lineCount: null,
      material: null,
      province: null,
      slug: title.toLowerCase().replaceAll(" ", "-"),
      title,
      type: "text",
      wordCount: null,
    },
  };
}

describe("library text tree utilities", () => {
  describe(numberedOf, () => {
    it.each([
      ["Book 1", "1", "Book"],
      ["Carmina 21", "21", "Carmina"],
      ["42", "42", ""],
      ["Liber Iii", "3", "Liber"],
      ["Capitula Ix Xxii", "9–22", "Capitula"],
      ["Carmina 1-20", "1–20", "Carmina"],
    ])("reads %s as number %s", (title, label, prefix) => {
      expect(numberedOf(row(title))).toMatchObject({ label, prefix });
    });

    it.each([
      "Liber Primus",
      "Praefatio",
      "Mix",
      "Ab Urbe Condita Books 1 10 21 30",
      "Iii",
    ])("does not read %s as numbered", (title) => {
      expect(numberedOf(row(title))).toBeNull();
    });
  });

  describe(splitLevel, () => {
    const numbers = (count: number): LibraryTextRow[] =>
      Array.from({ length: count }, (_, index) =>
        row(`Carmina ${String(count - index)}`),
      );

    it("keeps the top level as rows", () => {
      const level = splitLevel(numbers(5), 0);

      expect(level.groups).toStrictEqual([]);
      expect(level.rows).toHaveLength(5);
    });

    it("gathers numbered leaves into one unlabelled group in numeric order", () => {
      const level = splitLevel([row("Praefatio"), ...numbers(12)], 1);

      expect(level.rows.map(({ text }) => text.title)).toStrictEqual([
        "Praefatio",
      ]);
      expect(level.groups).toHaveLength(1);
      expect(level.groups[0]?.label).toBe("");
      expect(level.groups[0]?.items.map(({ label }) => label)).toStrictEqual(
        Array.from({ length: 12 }, (_, index) => String(index + 1)),
      );
    });

    it("splits a long run into ranges of twenty", () => {
      const level = splitLevel(numbers(45), 1);

      expect(level.groups.map(({ label }) => label)).toStrictEqual([
        "Carmina 1–20",
        "Carmina 21–40",
        "Carmina 41–45",
      ]);
    });

    it("keeps a numbered Text that has children as a row", () => {
      const level = splitLevel([row("Book 1", 3), ...numbers(3)], 1);

      expect(level.rows.map(({ text }) => text.title)).toStrictEqual([
        "Book 1",
      ]);
      expect(level.groups[0]?.items).toHaveLength(3);
    });

    it("keeps a lone number as a row", () => {
      const level = splitLevel([row("Praefatio"), row("Book 1")], 1);

      expect(level.groups).toStrictEqual([]);
      expect(level.rows).toHaveLength(2);
    });
  });
});
