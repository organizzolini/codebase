import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { NominalForm, Word, WordForm } from "@codebase/lexico-entities";

import { LexemeWordFormLoader } from "./lexeme-word-form.loader";
import { LexemeWordFormResolver } from "./lexeme-word-form.resolver";

import type { LexemeType } from "../lexemes/lexeme.entities";

describe(LexemeWordFormResolver, () => {
  const load = vi.fn<(lexemeId: string) => Promise<WordForm[]>>();
  let resolver: LexemeWordFormResolver;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LexemeWordFormResolver,
        { provide: LexemeWordFormLoader, useValue: { byLexemeId: { load } } },
      ],
    }).compile();

    resolver = await module.resolve(LexemeWordFormResolver);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(resolver).toBeDefined();
  });

  it("exposes each link as a form and the word written for it", async () => {
    expect.hasAssertions();

    const link = new WordForm();
    link.id = "link-1";
    link.form = new NominalForm();
    link.word = new Word();
    link.word.data = "rosae";
    load.mockResolvedValue([link]);

    const wordForms = await resolver.wordForms({
      id: "lexeme-1",
    } as LexemeType);

    expect(load).toHaveBeenCalledWith("lexeme-1");
    expect(wordForms.edges).toHaveLength(1);
    expect(wordForms.edges[0]?.node).toMatchObject({
      id: "link-1",
      word: "rosae",
    });
  });
});
