import { describe, expect, it } from "vitest";

import { mergeAuthor, parseText } from "./literature.utilities";

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
        collection: "Perseus",
        edition: "First edition",
        editors: "Editor One, Editor Two",
        printYear: 1901,
        publisher: "Publisher",
        workIdentifier: "urn:cts:latinLit:phi0959.phi006.perseus-lat2",
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
        collection: "EDCS",
        endYear: 50,
        findSpot: "Ostia",
        inscriptionType: "Grabinschrift",
        material: "Marmor",
        province: "Roma",
        startYear: -50,
      });
    });

    it("returns no attributes when the collection is not a known source", () => {
      expect(parseText({ collection: "Unknown" })).toStrictEqual({});
    });

    it("returns no attributes when frontmatter has none of the fields", () => {
      expect(parseText({ title: "Aeneid" })).toStrictEqual({});
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
});
