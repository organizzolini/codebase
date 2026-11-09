/* cspell:words amo */

import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it, vi } from "vitest";

import { Word } from "@codebase/lexico-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { WordFormType } from "./word-form.entities";
import { WordFormResolver } from "./word-form.resolver";
import { WordLinkLoader } from "./word-link.loader";
import { WordType } from "./word.entities";

import type { WordsService } from "./words.service";

describe(WordFormResolver, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(WordFormResolver, {
      mocks: [WordLinkLoader],
    });

    expect(instance).toBeInstanceOf(WordFormResolver);
  });

  it("resolves a word-form link's word through the loader", async () => {
    expect.hasAssertions();

    const word = Object.assign(new Word(), { data: "amo", id: "word-1" });
    const loader = new WordLinkLoader(createMock<WordsService>());
    vi.spyOn(loader.byWordFormId, "load").mockResolvedValue(word);
    const wordFormResolver = new WordFormResolver(loader);

    const resolved = await wordFormResolver.word(
      Object.assign(new WordFormType(), { id: "word-form-1" }),
    );

    expect(resolved).toBeInstanceOf(WordType);
    expect(resolved).toMatchObject({ data: "amo", id: "word-1" });
    expect(loader.byWordFormId.load).toHaveBeenCalledWith("word-form-1");
  });
});
