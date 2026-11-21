import * as z from "zod/mini";

import { LexemeCardDocument } from "../../../graphql/generated/operations";
import {
  queryApi,
  searchDictionary,
  toLexemeResult,
} from "../../search/search-results/search.utilities";

import type { LexemeResult } from "../../lexeme/lexeme-card/lexeme-card.types";
import type { ResultNode } from "../../search/search-results/search.types";
import type { HistoryLexemeInput } from "./history-lexeme.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Finds the lexeme a history entry recorded and shapes it like a search result.
 * An entry that kept no lexeme is searched for by its word instead.
 */
export async function findHistoryLexeme(
  input: Readonly<HistoryLexemeInput>,
): Promise<LexemeResult | null> {
  const { form, lexemeId, word } = input;

  if (lexemeId === undefined || lexemeId === null) {
    const [best] = await searchDictionary(word);

    return best ?? null;
  }

  const { lexeme } = await queryApi(LexemeCardDocument, { id: lexemeId });

  if (lexeme === null) {
    return null;
  }

  return toLexemeResult(
    {
      distance: null,
      enclitic: null,
      identifiers: form === undefined || form === null ? [] : [form],
      lexeme: z.custom<ResultNode["lexeme"]>().parse(lexeme),
      score: 1,
      source: "WORD_EXACT",
    },
    word.toLowerCase(),
  );
}
