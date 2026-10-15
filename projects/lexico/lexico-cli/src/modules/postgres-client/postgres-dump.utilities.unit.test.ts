import { describe, expect, it } from "vitest";

import {
  dumpedTables,
  parsePostgresDumpContents,
  selectPostgresDumpEntries,
} from "./postgres-dump.utilities";

/** `pg_restore --list --verbose` of a dump of two Lexico tables and one archived one. */
const LISTING = [
  ";",
  "; Archive created at 2026-10-15 04:12:46 UTC",
  ";     dbname: lexico_development",
  ";",
  "; Selected TOC Entries:",
  ";",
  "3496; 0 0 ENCODING - ENCODING ",
  "3497; 0 0 STDSTRINGS - STDSTRINGS ",
  "3498; 0 0 SEARCHPATH - SEARCHPATH ",
  "3499; 1262 5 DATABASE - lexico_development lexico_username",
  "3500; 0 0 COMMENT - DATABASE lexico_development lexico_username",
  ";\tdepends on: 3499",
  "224; 1259 16412 TABLE archive authors lexico_username",
  "223; 1259 16411 SEQUENCE archive authors_id_seq lexico_username",
  ";\tdepends on: 224",
  "3501; 0 0 SEQUENCE OWNED BY archive authors_id_seq lexico_username",
  ";\tdepends on: 223",
  "221; 1259 16386 TABLE lexico authors lexico_username",
  "3502; 0 0 COMMENT lexico TABLE authors lexico_username",
  ";\tdepends on: 221",
  "222; 1259 16396 TABLE lexico texts lexico_username",
  "3332; 2604 16415 DEFAULT archive authors id lexico_username",
  ";\tdepends on: 224 223 224",
  "3493; 0 16412 TABLE DATA archive authors lexico_username",
  ";\tdepends on: 224",
  "3490; 0 16386 TABLE DATA lexico authors lexico_username",
  ";\tdepends on: 221",
  "3491; 0 16396 TABLE DATA lexico texts lexico_username",
  ";\tdepends on: 222",
  "3503; 0 0 SEQUENCE SET archive authors_id_seq lexico_username",
  ";\tdepends on: 223",
  "3334; 2606 16393 CONSTRAINT lexico authors authors_pkey lexico_username",
  ";\tdepends on: 221",
  "3339; 2606 16404 CONSTRAINT lexico texts texts_pkey lexico_username",
  ";\tdepends on: 222",
  "3337; 1259 16410 INDEX lexico texts_author_index lexico_username",
  ";\tdepends on: 222",
  "3342; 2606 16405 FK CONSTRAINT lexico texts texts_author_id_fkey lexico_username",
  ";\tdepends on: 222 221 3334",
  "",
].join("\n");

describe("postgres-dump utilities", () => {
  describe(parsePostgresDumpContents, () => {
    it("reads every entry with its dependencies, naming the table of each table and data entry", () => {
      const entries = parsePostgresDumpContents(LISTING);

      expect(entries).toHaveLength(20);
      expect(entries.slice(0, 1)).toStrictEqual([
        { dependencies: [], id: 3496, kind: "header" },
      ]);
      expect(entries.find(({ id }) => id === 224)).toStrictEqual({
        dependencies: [],
        id: 224,
        kind: "table",
        table: "archive.authors",
      });
      expect(entries.find(({ id }) => id === 3491)).toStrictEqual({
        dependencies: [222],
        id: 3491,
        kind: "data",
        table: "lexico.texts",
      });
      expect(entries.find(({ id }) => id === 3342)).toStrictEqual({
        dependencies: [222, 221, 3334],
        id: 3342,
        kind: "other",
      });
    });

    it("keeps a table name that holds spaces whole", () => {
      expect(
        parsePostgresDumpContents(
          "222; 1259 16395 TABLE public Odd Name lexico_username\n",
        ),
      ).toStrictEqual([
        { dependencies: [], id: 222, kind: "table", table: "public.Odd Name" },
      ]);
    });

    it("does not read a partition's TABLE ATTACH as a table", () => {
      expect(
        parsePostgresDumpContents(
          "3400; 0 0 TABLE ATTACH lexico words_2026 lexico_username\n",
        ),
      ).toStrictEqual([{ dependencies: [], id: 3400, kind: "other" }]);
    });

    it("reads nothing from a listing with no entries", () => {
      expect(parsePostgresDumpContents(";\n; Archive\n")).toStrictEqual([]);
    });
  });

  describe(dumpedTables, () => {
    const entries = parsePostgresDumpContents(LISTING);

    it("names every table whose definition the dump holds", () => {
      expect(dumpedTables(entries, "table")).toStrictEqual(
        new Set(["archive.authors", "lexico.authors", "lexico.texts"]),
      );
    });

    it("names every table whose rows the dump holds", () => {
      expect(
        dumpedTables(parsePostgresDumpContents(LISTING), "data"),
      ).toStrictEqual(
        new Set(["archive.authors", "lexico.authors", "lexico.texts"]),
      );
    });
  });

  describe(selectPostgresDumpEntries, () => {
    const entries = parsePostgresDumpContents(LISTING);

    it("selects a table with everything that hangs off it, and nothing of the others", () => {
      expect(
        selectPostgresDumpEntries(entries, ["lexico.authors"]),
      ).toStrictEqual([3496, 3497, 3498, 221, 3502, 3490, 3334]);
    });

    it("leaves out a constraint that also needs a table left out", () => {
      expect(
        selectPostgresDumpEntries(entries, ["lexico.texts"]),
      ).toStrictEqual([3496, 3497, 3498, 222, 3491, 3339, 3337]);
    });

    it("selects a table's owned sequence, its default, and its value", () => {
      expect(
        selectPostgresDumpEntries(entries, ["archive.authors"]),
      ).toStrictEqual([3496, 3497, 3498, 224, 223, 3501, 3332, 3493, 3503]);
    });

    it("selects the whole dump, unattributed entries included, when every table in it is selected", () => {
      expect(
        selectPostgresDumpEntries(entries, [
          "archive.authors",
          "lexico.authors",
          "lexico.texts",
        ]),
      ).toStrictEqual(entries.map(({ id }) => id));
    });

    it("keeps a data-only dump's sequence value, whose sequence it does not hold, only for the whole dump", () => {
      const dataOnly = parsePostgresDumpContents(
        [
          "3476; 0 16386 TABLE DATA archive authors lexico_username",
          ";\tdepends on: 221",
          "3477; 0 16395 TABLE DATA lexico words lexico_username",
          ";\tdepends on: 222",
          "3485; 0 0 SEQUENCE SET archive authors_id_seq lexico_username",
          ";\tdepends on: 220",
        ].join("\n"),
      );

      expect(
        selectPostgresDumpEntries(dataOnly, [
          "archive.authors",
          "lexico.words",
        ]),
      ).toStrictEqual([3476, 3477, 3485]);
      expect(
        selectPostgresDumpEntries(dataOnly, ["lexico.words"]),
      ).toStrictEqual([3477]);
    });
  });
});
