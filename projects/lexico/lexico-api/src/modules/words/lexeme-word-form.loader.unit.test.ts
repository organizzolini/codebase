import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LexemeWordFormLoader } from "./lexeme-word-form.loader";
import { WordsService } from "./words.service";

import type { WordForm } from "@codebase/lexico-entities";

/**
 * Builds a word-form link whose form belongs to the given lexeme.
 */
function link(id: string, lexemeId: string): WordForm {
  return { form: { lexeme: { id: lexemeId } }, id } as WordForm;
}

describe(LexemeWordFormLoader, () => {
  const findWordFormsByLexemeIds =
    vi.fn<WordsService["findWordFormsByLexemeIds"]>();
  let dataloader: LexemeWordFormLoader;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LexemeWordFormLoader,
        {
          provide: WordsService,
          useValue: { findWordFormsByLexemeIds },
        },
      ],
    }).compile();

    dataloader = await module.resolve(LexemeWordFormLoader);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(dataloader).toBeDefined();
  });

  it("loads every lexeme asked for in one query, each with its own links", async () => {
    expect.hasAssertions();

    findWordFormsByLexemeIds.mockResolvedValue([
      link("1", "rosa"),
      link("2", "sum"),
      link("3", "rosa"),
    ]);

    const [rosa, sum, none] = await Promise.all([
      dataloader.byLexemeId.load("rosa"),
      dataloader.byLexemeId.load("sum"),
      dataloader.byLexemeId.load("edo"),
    ]);

    expect(findWordFormsByLexemeIds).toHaveBeenCalledExactlyOnceWith([
      "rosa",
      "sum",
      "edo",
    ]);
    expect(rosa.map(({ id }) => id)).toStrictEqual(["1", "3"]);
    expect(sum.map(({ id }) => id)).toStrictEqual(["2"]);
    expect(none).toStrictEqual([]);
  });
});
