import { describe, expect, it } from "vitest";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "./library-sort.entities";
import { sortColumnSql, textOrderSql } from "./library.functions";

describe("library functions", () => {
  describe(sortColumnSql, () => {
    it("reads a plain attribute straight from its column", () => {
      expect.hasAssertions();

      expect(sortColumnSql(LibrarySortField.TEXT_TITLE, "text")).toBe(
        "text.title",
      );
    });

    it("ranks eras by an explicit chronological CASE", () => {
      expect.hasAssertions();

      expect(sortColumnSql(LibrarySortField.AUTHOR_ERA, "author")).toBe(
        "CASE CAST(author.era AS TEXT) WHEN 'Archaic' THEN 0 WHEN 'Classical' THEN 1 WHEN 'Imperial' THEN 2 WHEN 'Late' THEN 3 WHEN 'Medieval' THEN 4 WHEN 'Neo-Latin' THEN 5 END",
      );
    });

    it("ranks collections by an explicit CASE, not the alphabet", () => {
      expect.hasAssertions();

      expect(sortColumnSql(LibrarySortField.TEXT_COLLECTION, "sub")).toBe(
        "CASE CAST(sub.collection AS TEXT) WHEN 'Perseus' THEN 0 WHEN 'The Latin Library' THEN 1 WHEN 'CSEL' THEN 2 WHEN 'EDCS' THEN 3 END",
      );
    });
  });

  describe(textOrderSql, () => {
    it("orders by the title alone when no sort names a Text attribute", () => {
      expect.hasAssertions();

      expect(
        textOrderSql([
          {
            direction: LibrarySortDirection.DESC,
            field: LibrarySortField.AUTHOR_NAME,
          },
        ]),
      ).toBe("text.title ASC, text.id ASC");
    });

    it("applies every Text sort in list order, each with its own direction", () => {
      expect.hasAssertions();

      expect(
        textOrderSql([
          {
            direction: LibrarySortDirection.DESC,
            field: LibrarySortField.TEXT_PRINT_YEAR,
          },
          {
            direction: LibrarySortDirection.ASC,
            field: LibrarySortField.AUTHOR_ERA,
          },
          {
            direction: LibrarySortDirection.ASC,
            field: LibrarySortField.TEXT_LINE_COUNT,
          },
        ]),
      ).toBe(
        "text.print_year DESC NULLS LAST, text.line_count ASC NULLS LAST, text.title ASC, text.id ASC",
      );
    });
  });
});
