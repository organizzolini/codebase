import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { FoldingService } from "./folding.service";

import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

function configure(
  fold: ResolvedCoinagerieConfiguration["fold"],
): ResolvedCoinagerieConfiguration {
  return {
    configurationPath: "/project/coinagerie.config.ts",
    directory: "/project",
    exclude: { paths: [], words: [] },
    fold,
    include: ["**"],
    outputs: [],
  };
}

describe(FoldingService, () => {
  let service: FoldingService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [FoldingService],
    }).compile();

    service = await module.resolve(FoldingService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("fold", () => {
    it.each([
      ["a regular plural", "aspects", "aspect"],
      ["an irregular plural", "indices", "index"],
      ["a plural in -ies", "glossaries", "glossary"],
      ["a plural in -es", "processes", "process"],
      ["an invented plural", "lexemes", "lexeme"],
      ["a past participle", "configured", "configure"],
      ["a present participle", "configuring", "configure"],
      ["a third-person verb", "configures", "configure"],
      ["an irregular past tense", "ran", "run"],
      ["an irregular present participle", "running", "run"],
      ["a plural that is also a verb form", "uses", "use"],
    ])("folds %s", (_case, word, expected) => {
      expect(service.fold(word)).toBe(expected);
    });

    it.each([
      ["a derivational family member", "configuration"],
      ["a singular", "aspect"],
      ["an invariant noun", "series"],
      ["a word ending in -ss", "class"],
      ["a bare lemma", "configure"],
      ["a word with no inflection", "ephemeris"],
    ])("leaves %s alone", (_case, word) => {
      expect(service.fold(word)).toBe(word);
    });

    it.each([
      ["ts", "ts"],
      ["as", "as"],
      ["js", "js"],
    ])("keeps %s whole rather than shrink it to one letter", (word) => {
      expect(service.fold(word)).toBe(word);
    });
  });

  describe("headword", () => {
    it("folds plurals and inflections when no fold is configured", () => {
      expect(service.headword("configured", configure(undefined))).toBe(
        "configure",
      );
      expect(service.headword("configuration", configure(undefined))).toBe(
        "configuration",
      );
    });

    it("runs the configured fold on the folded lemma, not the surface form", () => {
      const fold = (word: string): string =>
        word === "configure" ? "setup" : word;

      expect(service.headword("configured", configure(fold))).toBe("setup");
      expect(service.headword("configures", configure(fold))).toBe("setup");
      expect(service.headword("aspects", configure(fold))).toBe("aspect");
    });

    it("lets a configured fold merge a derivational family", () => {
      const fold = (word: string): string =>
        word === "configuration" ? "configure" : word;

      expect(service.headword("configuration", configure(fold))).toBe(
        "configure",
      );
    });
  });
});
