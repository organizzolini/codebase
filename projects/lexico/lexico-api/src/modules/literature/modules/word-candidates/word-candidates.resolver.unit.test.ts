/* cspell:words canō */

import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it, vi } from "vitest";

import {
  FiniteVerbForm,
  Lexeme,
  WordForm,
  WordLexeme,
} from "@codebase/lexico-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { WordCandidatesResolver } from "./word-candidates.resolver";
import { WordCandidatesService } from "./word-candidates.service";

describe(WordCandidatesResolver, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(WordCandidatesResolver, {
      mocks: [WordCandidatesService],
    });

    expect(instance).toBeInstanceOf(WordCandidatesResolver);
  });

  it("maps the word forms of a token to its candidates", async () => {
    expect.hasAssertions();

    const lexeme = new Lexeme();
    lexeme.id = "lexeme-1";
    lexeme.lemma = "canō";
    lexeme.partOfSpeech = "verb";
    lexeme.translations = [];
    const form = new FiniteVerbForm();
    form.lexeme = lexeme;
    form.mood = "indicative";
    form.number = "singular";
    form.person = "first";
    form.tense = "present";
    form.voice = "active";
    const wordForm = new WordForm();
    wordForm.form = form;

    const mockService = createMock<WordCandidatesService>({
      findWordFormsForToken: vi
        .fn<WordCandidatesService["findWordFormsForToken"]>()
        .mockResolvedValue([wordForm]),
      findWordLexemesForToken: vi
        .fn<WordCandidatesService["findWordLexemesForToken"]>()
        .mockResolvedValue([]),
    });

    const resolver = new WordCandidatesResolver(mockService);

    await expect(
      resolver.wordCandidates({ tokenId: "token-1" }),
    ).resolves.toMatchObject([
      {
        definition: null,
        description: "present indicative active first singular",
        lemma: "canō",
        lexemeId: "lexeme-1",
        partOfSpeech: "verb",
      },
    ]);
    expect(mockService.findWordFormsForToken).toHaveBeenCalledWith("token-1");
  });

  it("adds the lexemes a word is a headword of when no form names them", async () => {
    expect.hasAssertions();

    const lexeme = new Lexeme();
    lexeme.id = "lexeme-2";
    lexeme.lemma = "ab";
    lexeme.partOfSpeech = "preposition";
    lexeme.translations = [];
    const wordLexeme = new WordLexeme();
    wordLexeme.lexeme = lexeme;

    const mockService = createMock<WordCandidatesService>({
      findWordFormsForToken: vi
        .fn<WordCandidatesService["findWordFormsForToken"]>()
        .mockResolvedValue([]),
      findWordLexemesForToken: vi
        .fn<WordCandidatesService["findWordLexemesForToken"]>()
        .mockResolvedValue([wordLexeme]),
    });

    const resolver = new WordCandidatesResolver(mockService);

    await expect(
      resolver.wordCandidates({ tokenId: "token-1" }),
    ).resolves.toMatchObject([
      {
        description: "headword",
        lemma: "ab",
        lexemeId: "lexeme-2",
        partOfSpeech: "preposition",
      },
    ]);
  });
});
