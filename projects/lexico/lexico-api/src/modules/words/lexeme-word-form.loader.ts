import { Inject, Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { WordsService } from "./words.service";

import type { WordForm } from "@codebase/lexico-entities";

/**
 * Request-scoped DataLoader resolving each lexeme to the word-form links of
 * its forms. Every `load` issued in the same tick shares one query, however
 * many lexemes a search returned, and each lexeme's links are cached for the
 * rest of the request.
 */
@Injectable({ scope: Scope.REQUEST })
export class LexemeWordFormLoader {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(WordsService)
    private readonly wordsService: WordsService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  public readonly byLexemeId = new DataLoader<string, WordForm[]>(
    async (lexemeIds) => {
      const wordForms =
        await this.wordsService.findWordFormsByLexemeIds(lexemeIds);
      const wordFormsByLexemeId = new Map<string, WordForm[]>();

      for (const wordForm of wordForms) {
        const lexemeId = wordForm.form.lexeme.id;

        wordFormsByLexemeId.set(lexemeId, [
          ...(wordFormsByLexemeId.get(lexemeId) ?? []),
          wordForm,
        ]);
      }

      return lexemeIds.map(
        (lexemeId) => wordFormsByLexemeId.get(lexemeId) ?? [],
      );
    },
  );

  // 🔏 Private Methods

  // 🌎 Public Methods
}
