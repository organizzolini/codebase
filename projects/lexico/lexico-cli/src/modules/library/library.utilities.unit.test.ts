import { describe, expect, it } from "vitest";

import {
  cleanBoilerplate,
  formatLineNumber,
  hasValidTextContent,
  isEnglishBoilerplate,
  splitTextAttributes,
  toBoundedSlug,
  toBoundedTitle,
} from "./library.utilities";

describe("library.utilities", () => {
  describe(cleanBoilerplate, () => {
    it("removes known boilerplate phrases and trims whitespace", () => {
      const text =
        "  The Latin Library text from The Classics Page Neo-Latin  ";

      const cleanedText = cleanBoilerplate(text);

      expect(cleanedText).toBe("text from");
    });

    it("returns original text when no boilerplate exists", () => {
      const text = "sample text line";

      const cleanedText = cleanBoilerplate(text);

      expect(cleanedText).toBe("sample text line");
    });
  });

  describe(formatLineNumber, () => {
    it("moves end-of-line number to the front in bold", () => {
      const formattedLine = formatLineNumber("sample text line   42");

      expect(formattedLine).toBe("**42** sample text line");
    });

    it("formats bracketed prefixes", () => {
      const formattedLine = formatLineNumber("[IV] text");

      expect(formattedLine).toBe("**[IV]** text");
    });

    it("formats decimal prefixes", () => {
      const formattedLine = formatLineNumber("1.2.3. sentence");

      expect(formattedLine).toBe("**1.2.3.** sentence");
    });

    it("formats simple numeric prefixes", () => {
      const formattedLine = formatLineNumber("12 words");

      expect(formattedLine).toBe("**12** words");
    });

    it("formats roman numeral prefixes", () => {
      const formattedLine = formatLineNumber("XII sentence");

      expect(formattedLine).toBe("**XII** sentence");
    });

    it("keeps existing bold prefix unchanged", () => {
      const formattedLine = formatLineNumber("**12** words");

      expect(formattedLine).toBe("**12** words");
    });

    it("moves bolded end number to the front", () => {
      const formattedLine = formatLineNumber("versus  **17**");

      expect(formattedLine).toBe("**17** versus");
    });
  });

  describe(hasValidTextContent, () => {
    it("returns false for empty paragraph list", () => {
      const validTextContent = hasValidTextContent([]);

      expect(validTextContent).toBe(false);
    });

    it("returns false when no alphabetical characters exist", () => {
      const validTextContent = hasValidTextContent(["123", "--", "456"]);

      expect(validTextContent).toBe(false);
    });

    it("returns true when alphabetical characters are present", () => {
      const validTextContent = hasValidTextContent(["123", "word", "456"]);

      expect(validTextContent).toBe(true);
    });
  });

  describe(isEnglishBoilerplate, () => {
    it("returns false when line has no words", () => {
      const englishBoilerplate = isEnglishBoilerplate("123 --");

      expect(englishBoilerplate).toBe(false);
    });

    it("returns true when stop word count is at least three", () => {
      const englishBoilerplate = isEnglishBoilerplate("the and of");

      expect(englishBoilerplate).toBe(true);
    });

    it("returns true for long lines with high stop-word ratio", () => {
      const englishBoilerplate = isEnglishBoilerplate(
        "the source and text by author with context",
      );

      expect(englishBoilerplate).toBe(true);
    });

    it("returns false for latin-like content", () => {
      const englishBoilerplate = isEnglishBoilerplate(
        "alpha beta gamma delta epsilon zeta",
      );

      expect(englishBoilerplate).toBe(false);
    });
  });

  describe(splitTextAttributes, () => {
    it("moves typed source fields out of the remaining metadata", () => {
      const result = splitTextAttributes("Perseus", {
        cts_urn: "urn:cts:latinLit:phi0959.phi006.perseus-lat2",
        editors: ["Editor One", "Editor Two"],
        print_publication_date: "1901",
        publisher: "Publisher",
        sourceUrl: "phi0959/source.xml",
      });

      expect(result).toStrictEqual({
        attributes: {
          collection: "Perseus",
          editors: "Editor One, Editor Two",
          print_year: 1901,
          publisher: "Publisher",
          work_identifier: "urn:cts:latinLit:phi0959.phi006.perseus-lat2",
        },
        remaining: { sourceUrl: "phi0959/source.xml" },
      });
    });

    it("omits typed fields the source does not provide", () => {
      const result = splitTextAttributes("CSEL", { sourceUrl: "x.xml" });

      expect(result).toStrictEqual({
        attributes: { collection: "CSEL" },
        remaining: { sourceUrl: "x.xml" },
      });
    });

    it("leaves print_year unset when the date has no four-digit year", () => {
      const result = splitTextAttributes("CSEL", {
        print_publication_date: "s.d.",
      });

      expect(result.attributes).toStrictEqual({ collection: "CSEL" });
    });
  });

  describe(toBoundedSlug, () => {
    it("kebab-cases a short name unchanged in length", () => {
      expect(toBoundedSlug("De Bello Gallico")).toBe("de-bello-gallico");
    });

    it("cuts a long name at a word boundary and keeps a hash for uniqueness", () => {
      const heading = Array.from(
        { length: 30 },
        (_, index) => `Liber ${index}`,
      ).join(" ");

      const slug = toBoundedSlug(heading);

      expect(slug.length).toBeLessThanOrEqual(40);
      expect(slug).toMatch(/^liber-0-liber-1-liber-2-liber-3-[0-9a-z]{6}$/);
    });

    it("gives two long names with a shared start different slugs", () => {
      const start = "Liber ".repeat(20);

      expect(toBoundedSlug(`${start} Primus`)).not.toBe(
        toBoundedSlug(`${start} Secundus`),
      );
    });

    it("is deterministic", () => {
      const heading = "Liber ".repeat(40);

      expect(toBoundedSlug(heading)).toBe(toBoundedSlug(heading));
    });
  });

  describe(toBoundedTitle, () => {
    it("leaves a title within the limit untouched", () => {
      expect(toBoundedTitle("Aeneid")).toBe("Aeneid");
    });

    it("cuts a long title at a word boundary within 128 characters", () => {
      const title = "Liber ".repeat(60).trim();

      const bounded = toBoundedTitle(title);

      expect(bounded.length).toBeLessThanOrEqual(128);
      expect(bounded.endsWith("Liber…")).toBe(true);
    });
  });
});
