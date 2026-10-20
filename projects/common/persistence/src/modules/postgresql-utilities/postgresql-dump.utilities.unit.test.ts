import { describe, expect, it } from "vitest";

import {
  dumpedTables,
  missingDumpTables,
  parsePostgresDumpContents,
  selectPostgresDumpEntries,
} from "./postgresql-dump.utilities";

/** `pg_restore --list --verbose` of a dump of two fixture tables and one archived one. */
const LISTING = [
  ";",
  "; Archive created at 2026-10-15 04:12:46 UTC",
  ";     dbname: fixture_development",
  ";",
  "; Selected TOC Entries:",
  ";",
  "3496; 0 0 ENCODING - ENCODING ",
  "3497; 0 0 STDSTRINGS - STDSTRINGS ",
  "3498; 0 0 SEARCHPATH - SEARCHPATH ",
  "3499; 1262 5 DATABASE - fixture_development fixture_username",
  "3500; 0 0 COMMENT - DATABASE fixture_development fixture_username",
  ";\tdepends on: 3499",
  "224; 1259 16412 TABLE archive widgets fixture_username",
  "223; 1259 16411 SEQUENCE archive authors_id_seq fixture_username",
  ";\tdepends on: 224",
  "3501; 0 0 SEQUENCE OWNED BY archive authors_id_seq fixture_username",
  ";\tdepends on: 223",
  "221; 1259 16386 TABLE fixture widgets fixture_username",
  "3502; 0 0 COMMENT fixture TABLE widgets fixture_username",
  ";\tdepends on: 221",
  "222; 1259 16396 TABLE fixture parts fixture_username",
  "3332; 2604 16415 DEFAULT archive widgets id fixture_username",
  ";\tdepends on: 224 223 224",
  "3493; 0 16412 TABLE DATA archive widgets fixture_username",
  ";\tdepends on: 224",
  "3490; 0 16386 TABLE DATA fixture widgets fixture_username",
  ";\tdepends on: 221",
  "3491; 0 16396 TABLE DATA fixture parts fixture_username",
  ";\tdepends on: 222",
  "3503; 0 0 SEQUENCE SET archive authors_id_seq fixture_username",
  ";\tdepends on: 223",
  "3334; 2606 16393 CONSTRAINT fixture widgets authors_pkey fixture_username",
  ";\tdepends on: 221",
  "3339; 2606 16404 CONSTRAINT fixture parts texts_pkey fixture_username",
  ";\tdepends on: 222",
  "3337; 1259 16410 INDEX fixture texts_author_index fixture_username",
  ";\tdepends on: 222",
  "3342; 2606 16405 FK CONSTRAINT fixture parts texts_author_id_fkey fixture_username",
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
        table: "archive.widgets",
      });
      expect(entries.find(({ id }) => id === 3491)).toStrictEqual({
        dependencies: [222],
        id: 3491,
        kind: "data",
        table: "fixture.parts",
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
          "222; 1259 16395 TABLE public Odd Name fixture_username\n",
        ),
      ).toStrictEqual([
        { dependencies: [], id: 222, kind: "table", table: "public.Odd Name" },
      ]);
    });

    it("does not read a partition's TABLE ATTACH as a table", () => {
      expect(
        parsePostgresDumpContents(
          "3400; 0 0 TABLE ATTACH fixture words_2026 fixture_username\n",
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
        new Set(["archive.widgets", "fixture.parts", "fixture.widgets"]),
      );
    });

    it("names every table whose rows the dump holds", () => {
      expect(
        dumpedTables(parsePostgresDumpContents(LISTING), "data"),
      ).toStrictEqual(
        new Set(["archive.widgets", "fixture.parts", "fixture.widgets"]),
      );
    });
  });

  describe(selectPostgresDumpEntries, () => {
    const entries = parsePostgresDumpContents(LISTING);

    it("selects a table with everything that hangs off it, and nothing of the others", () => {
      expect(
        selectPostgresDumpEntries(entries, ["fixture.widgets"]),
      ).toStrictEqual([3496, 3497, 3498, 221, 3502, 3490, 3334]);
    });

    it("leaves out a constraint that also needs a table left out", () => {
      expect(
        selectPostgresDumpEntries(entries, ["fixture.parts"]),
      ).toStrictEqual([3496, 3497, 3498, 222, 3491, 3339, 3337]);
    });

    it("selects a table's owned sequence, its default, and its value", () => {
      expect(
        selectPostgresDumpEntries(entries, ["archive.widgets"]),
      ).toStrictEqual([3496, 3497, 3498, 224, 223, 3501, 3332, 3493, 3503]);
    });

    it("selects the whole dump, unattributed entries included, when every table in it is selected", () => {
      expect(
        selectPostgresDumpEntries(entries, [
          "archive.widgets",
          "fixture.widgets",
          "fixture.parts",
        ]),
      ).toStrictEqual(entries.map(({ id }) => id));
    });

    it("keeps a data-only dump's sequence value, whose sequence it does not hold, only for the whole dump", () => {
      const dataOnly = parsePostgresDumpContents(
        [
          "3476; 0 16386 TABLE DATA archive widgets fixture_username",
          ";\tdepends on: 221",
          "3477; 0 16395 TABLE DATA fixture widgets fixture_username",
          ";\tdepends on: 222",
          "3485; 0 0 SEQUENCE SET archive authors_id_seq fixture_username",
          ";\tdepends on: 220",
        ].join("\n"),
      );

      expect(
        selectPostgresDumpEntries(dataOnly, [
          "archive.widgets",
          "fixture.widgets",
        ]),
      ).toStrictEqual([3476, 3477, 3485]);
      expect(
        selectPostgresDumpEntries(dataOnly, ["fixture.widgets"]),
      ).toStrictEqual([3477]);
    });
  });

  describe(missingDumpTables, () => {
    it("names every table pg_dump found no match for, in order", () => {
      const detail = [
        'pg_dump: error: no matching tables were found for pattern "fixture.nope"',
        'pg_dump: error: no matching tables were found for pattern "fixture.also nope"',
      ].join("\n");

      expect(missingDumpTables(detail)).toStrictEqual([
        "fixture.nope",
        "fixture.also nope",
      ]);
    });

    it.each([
      ["an unrelated failure", "pg_dump: error: connection to server failed"],
      ["an empty message", ""],
      ["a different pattern", "pg_dump: error: no matching schemas were found"],
    ])("finds nothing in %s", (_name, detail) => {
      expect(missingDumpTables(detail)).toStrictEqual([]);
    });
  });
});
