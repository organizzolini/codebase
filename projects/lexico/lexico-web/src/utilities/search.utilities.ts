import { print } from "graphql";
import lodash from "lodash";
import { z } from "zod";

import {
  connectionSchema,
  DEFAULT_LEXICO_API_URL,
  SEARCH_PAGE_SIZE,
} from "../constants/search-api.constants";
import {
  SearchEnglishDocument,
  SearchLatinDocument,
} from "../graphql/generated/operations";

import type { LexemeResult } from "../components/lexeme-card.types";
import type { LexemeInflection } from "../components/lexeme-header.types";
import type { LexemeMatchInfo } from "../components/lexeme-match.types";
import type { ApiResponse, ResultNode } from "../types/search.types";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

// 🌎 Public Functions

/**
 * Says how a search matched a lexeme from the tier the API ranked it in. A
 * partial headword match on the query's letters is a prefix match, whose
 * distance is how many letters the headword has beyond the query, and a fuzzy
 * match carries the edit distance the API measured.
 */
export function describeMatch(match: {
  distance: null | number;
  lemma: string;
  query: string;
  source: string;
}): LexemeMatchInfo {
  const { distance, lemma, query, source } = match;
  const letters = lemma.normalize("NFD").replaceAll(/\p{Diacritic}/gu, "");
  const extraLetters = Math.max(0, letters.length - query.length);

  switch (source) {
    case "ENCLITIC": {
      return { kind: "enclitic" };
    }
    case "FUZZY": {
      return { distance: distance ?? undefined, kind: "fuzzy" };
    }
    case "LEMMA_EXACT": {
      return { kind: "exact-headword" };
    }
    case "PREFIX": {
      return { extraLetters, kind: "prefix" };
    }
    case "TRANSLATION_EXACT": {
      return { kind: "translation-exact" };
    }
    case "TRANSLATION_PREFIX": {
      return { kind: "translation-prefix" };
    }
    case "WORD_EXACT": {
      return { kind: "exact-form" };
    }
    default: {
      return { kind: "contains" };
    }
  }
}

/**
 * Searches the dictionary in Latin and in English at once, since a query is
 * not labeled with the language it is written in, and merges what both find,
 * best match first. A lexeme both searches found keeps its higher score.
 */
export async function searchDictionary(query: string): Promise<LexemeResult[]> {
  const trimmed = query.trim();

  if (trimmed === "") {
    return [];
  }

  const [latin, english] = await Promise.all([
    searchLatin(trimmed),
    searchEnglish(trimmed),
  ]);
  const best = lodash.uniqBy(
    lodash.orderBy([...latin, ...english], "score", "desc"),
    "lexeme.id",
  );

  return best.map(({ distance, enclitic, identifiers, lexeme, source }) => ({
    enclitic: enclitic ?? null,
    etymology: lexeme.etymology,
    forms: (lexeme.wordForms?.edges ?? []).map(
      ({
        node: {
          form: { __typename: kind, ...grammar },
          id,
          word,
        },
      }) => ({
        ...grammar,
        id,
        kind,
        word,
      }),
    ),
    id: lexeme.id,
    identifiers,
    inflection: toLexemeInflection(lexeme.inflection),
    lemma: lexeme.lemma,
    match: describeMatch({
      distance: distance ?? null,
      lemma: lexeme.lemma,
      query: trimmed.toLowerCase(),
      source,
    }),
    partOfSpeech: lexeme.partOfSpeech,
    principalParts: lexeme.principalParts.edges.flatMap(({ node }) =>
      node.text.slice(0, 1),
    ),
    pronunciations: (lexeme.pronunciations?.edges ?? []).flatMap(
      ({ node: { phonetic, variant } }) =>
        phonetic === null ? [] : [{ phonetic, variant }],
    ),
    source,
    translations: (lexeme.translations?.edges ?? []).map(
      ({ node: translation }) => translation.data,
    ),
  }));
}

/**
 * Searches English through the lexico API and returns the results it matched.
 */
export async function searchEnglish(query: string): Promise<ResultNode[]> {
  const data = await queryApi(SearchEnglishDocument, {
    first: SEARCH_PAGE_SIZE,
    query,
  });
  const connection = connectionSchema
    .optional()
    .parse(z.record(z.string(), z.unknown()).parse(data)["searchEnglish"]);

  return searchLanguage(connection);
}

/**
 * Searches Latin through the lexico API and returns the results it matched.
 */
export async function searchLatin(query: string): Promise<ResultNode[]> {
  const data = await queryApi(SearchLatinDocument, {
    first: SEARCH_PAGE_SIZE,
    query,
  });
  const connection = connectionSchema
    .optional()
    .parse(z.record(z.string(), z.unknown()).parse(data)["searchLatin"]);

  return searchLanguage(connection);
}

/**
 * One lexeme's inflection as UI copy expects it, without GraphQL typename.
 */
export function toLexemeInflection(
  inflection: LexemeInflection | null,
): LexemeInflection | null {
  if (inflection === null) {
    return inflection;
  }
  return inflection;
}

/**
 * Runs one GraphQL query against the lexico API and returns its data.
 */
async function queryApi<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const response = await fetch(
    process.env["LEXICO_API_URL"] ?? DEFAULT_LEXICO_API_URL,
    {
      body: JSON.stringify({ query: print(document), variables }),
      headers: { "content-type": "application/json" },
      method: "POST",
    },
  );
  const body = (await response.json()) as ApiResponse;

  if (body.errors?.[0] !== undefined) {
    throw new Error(body.errors[0].message);
  }

  return z.custom<TResult>().parse(body.data);
}

/**
 * Searches Latin or English through the lexico API, which exposes each as its
 * own query, and returns the results it matched.
 */
function searchLanguage(
  connection:
    | null
    | undefined
    | {
        edges: {
          node: ResultNode;
        }[];
      },
): ResultNode[] {
  if (connection === null || connection === undefined) {
    return [];
  }

  const nodes = connection.edges.map((edge) => edge.node);

  return lodash.orderBy(nodes, "score", "desc");
}
