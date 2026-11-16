import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it } from "vitest";

import {
  mergeAuthor,
  parseText,
  removeReplacedTexts,
} from "./literature.utilities";

import type { LibraryEntry } from "./literature.types";
import type { Text } from "@codebase/lexico-db";
import type { Repository } from "typeorm";

describe("literature.utilities", () => {
  describe(parseText, () => {
    it("maps frontmatter source fields onto typed text columns", () => {
      expect(
        parseText({
          collection: "Perseus",
          edition: "First edition",
          editors: "Editor One, Editor Two",
          print_year: 1901,
          publisher: "Publisher",
          work_identifier: "urn:cts:latinLit:phi0959.phi006.perseus-lat2",
        }),
      ).toStrictEqual({
        attributes: {
          collection: "Perseus",
          edition: "First edition",
          editors: "Editor One, Editor Two",
          printYear: 1901,
          publisher: "Publisher",
          workIdentifier: "urn:cts:latinLit:phi0959.phi006.perseus-lat2",
        },
        invalidFields: [],
      });
    });

    it("maps inscription frontmatter onto typed inscription columns", () => {
      expect(
        parseText({
          collection: "EDCS",
          end_year: 50,
          find_spot: "Ostia",
          inscription_type: "Grabinschrift",
          material: "Marmor",
          province: "Roma",
          start_year: -50,
        }),
      ).toStrictEqual({
        attributes: {
          collection: "EDCS",
          endYear: 50,
          findSpot: "Ostia",
          inscriptionType: "Grabinschrift",
          material: "Marmor",
          province: "Roma",
          startYear: -50,
        },
        invalidFields: [],
      });
    });

    it("reports a collection that is not a known source", () => {
      expect(parseText({ collection: "Unknown" })).toStrictEqual({
        attributes: {},
        invalidFields: ["collection"],
      });
    });

    it("keeps the valid fields when another field is invalid", () => {
      expect(
        parseText({
          collection: "Perseus",
          print_year: "nineteen oh one",
          publisher: "Publisher",
        }),
      ).toStrictEqual({
        attributes: { collection: "Perseus", publisher: "Publisher" },
        invalidFields: ["print_year"],
      });
    });

    it("returns no attributes when frontmatter has none of the fields", () => {
      expect(parseText({ title: "Aeneid" })).toStrictEqual({
        attributes: {},
        invalidFields: [],
      });
    });
  });

  describe(mergeAuthor, () => {
    it("maps author metadata dates and full name onto typed author columns", () => {
      expect(
        mergeAuthor(
          { metadata: { sourceUrl: "vergil.html" } },
          {
            birth_year: -70,
            death_year: 19,
            full_name: "Publius Ovidius Naso",
            nickname: "vergil",
          },
        ),
      ).toStrictEqual({
        endYear: 19,
        fullName: "Publius Ovidius Naso",
        metadata: { nickname: "vergil", sourceUrl: "vergil.html" },
        startYear: -70,
      });
    });

    it("omits fields the author metadata does not carry", () => {
      expect(
        mergeAuthor({ metadata: null }, { full_name: "Ennius" }),
      ).toStrictEqual({
        fullName: "Ennius",
        metadata: {},
      });
    });
  });

  describe(removeReplacedTexts, () => {
    const entry = (provider: string): LibraryEntry => ({
      authorSlug: "epigraphik-datenbank-clauss-slaby",
      fullPath: "roma/edcs-1.md",
      pathParts: ["roma"],
      provider,
      textSlug: "edcs-1",
      title: "EDCS 1",
    });

    it("soft-deletes the old numbered part texts of an EDCS author", async () => {
      const repository = createMock<Repository<Text>>();
      repository.find.mockResolvedValueOnce([
        { id: "part-1" } as Text,
        { id: "part-2" } as Text,
      ]);

      const removed = await removeReplacedTexts(repository, "author-id", [
        entry("epigraphik-datenbank-clauss-slaby"),
      ]);

      expect(removed).toBe(2);
      expect(repository.softDelete).toHaveBeenCalledWith(["part-1", "part-2"]);
    });

    it("deletes nothing when no part texts remain", async () => {
      const repository = createMock<Repository<Text>>();
      repository.find.mockResolvedValueOnce([]);

      const removed = await removeReplacedTexts(repository, "author-id", [
        entry("epigraphik-datenbank-clauss-slaby"),
      ]);

      expect(removed).toBe(0);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });

    it("leaves an author that has no EDCS text untouched", async () => {
      const repository = createMock<Repository<Text>>();

      const removed = await removeReplacedTexts(repository, "author-id", [
        entry("perseus"),
      ]);

      expect(removed).toBe(0);
      expect(repository.find).not.toHaveBeenCalled();
    });
  });
});
