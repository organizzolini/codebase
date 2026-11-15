import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it, vi } from "vitest";

import { Token, Word, WordForm } from "@codebase/lexico-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { createRepositoryMock } from "../../../testing/mocks";

import { WordCandidatesService } from "./word-candidates.service";

describe(WordCandidatesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(WordCandidatesService, {
      providers: [Token, WordForm].map((entity) => ({
        provide: getRepositoryToken(entity),
        useValue: createRepositoryMock(),
      })),
    });

    expect(instance).toBeInstanceOf(WordCandidatesService);
  });

  it.each([
    ["a missing token", null],
    ["a token with no word", { isPunctuation: false, word: null }],
    ["a punctuation token", { isPunctuation: true, word: new Word() }],
  ])("finds no word forms for %s", async (_, token) => {
    expect.hasAssertions();

    const tokenRepo = createRepositoryMock<Token>();
    vi.spyOn(tokenRepo, "findOne").mockResolvedValue(
      token as unknown as null | Token,
    );
    const wordFormRepo = createRepositoryMock<WordForm>();
    const find = vi.spyOn(wordFormRepo, "find");
    const service = new WordCandidatesService(tokenRepo, wordFormRepo);

    await expect(
      service.findWordFormsForToken("token-1"),
    ).resolves.toStrictEqual([]);
    expect(find).not.toHaveBeenCalled();
  });

  it("finds the word forms of the token's word", async () => {
    expect.hasAssertions();

    const word = new Word();
    word.id = "word-1";
    const token = new Token();
    token.id = "token-1";
    token.isPunctuation = false;
    token.word = word;

    const tokenRepo = createRepositoryMock<Token>();
    vi.spyOn(tokenRepo, "findOne").mockResolvedValue(token);
    const wordFormRepo = createRepositoryMock<WordForm>();
    const find = vi.spyOn(wordFormRepo, "find").mockResolvedValue([]);
    const service = new WordCandidatesService(tokenRepo, wordFormRepo);

    await service.findWordFormsForToken("token-1");

    expect(find).toHaveBeenCalledWith({
      order: { form: { lexeme: { translations: { id: "ASC" } } }, id: "ASC" },
      relations: { form: { lexeme: { translations: true } } },
      where: { word: { id: "word-1" } },
    });
  });
});
