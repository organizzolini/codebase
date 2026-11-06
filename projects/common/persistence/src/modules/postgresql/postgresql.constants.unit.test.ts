import { describe, expect, it } from "vitest";

import { PluralSnakeNamingStrategy } from "./postgresql.constants";

describe(PluralSnakeNamingStrategy, () => {
  const strategy = new PluralSnakeNamingStrategy();

  describe("tableName", () => {
    it.each([
      ["CalendarEvent", "calendar_events"],
      ["Lexeme", "lexemes"],
      ["Meander", "meanders"],
      ["Inflection", "inflections"],
      ["Person", "people"],
    ])("names %s as %s", (entity, table) => {
      expect(strategy.tableName(entity, "")).toBe(table);
    });

    it.each([["calendar_events"], ["lexemes"]])(
      "leaves the already-plural %s unchanged",
      (table) => {
        expect(strategy.tableName(table, "")).toBe(table);
      },
    );

    it("leaves an explicitly named plural table, as meanderaw's, unchanged", () => {
      expect(strategy.tableName("Meander", "meanders")).toBe("meanders");
    });

    it("honors a table name the entity specifies, pluralized", () => {
      expect(strategy.tableName("Whatever", "night_sky")).toBe("night_skies");
    });
  });

  // TypeORM hands joinTableName the two table names, not entity names.
  describe("joinTableName", () => {
    it.each([
      ["lexeme", "word", "lexemes_words"],
      ["word", "lexeme", "lexemes_words"],
      ["calendar_event", "aspect", "aspects_calendar_events"],
    ])("joins %s and %s as %s", (first, second, joinTable) => {
      expect(strategy.joinTableName(first, second, "", "")).toBe(joinTable);
    });

    it("sorts already-plural names without pluralizing them twice", () => {
      expect(strategy.joinTableName("words", "lexemes", "", "")).toBe(
        "lexemes_words",
      );
    });
  });

  it("keeps snake case column names", () => {
    expect(strategy.columnName("createdAt", "", [])).toBe("created_at");
  });
});
