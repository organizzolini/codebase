/* cspell:words FULLTEXT */

import {
  createFileRoute,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { createServerFn as createServerFunction } from "@tanstack/react-start";
import { print } from "graphql";
import lodash from "lodash";
import { useCallback, useMemo } from "react";
import { z } from "zod";

import { Button } from "@codebase/presentation";

import { SearchBar } from "../components/search-bar";
import { SearchLanding } from "../components/search-landing";
import { SearchResults } from "../components/search-results";
import {
  SearchEnglishDocument,
  SearchLatinDocument,
} from "../graphql/generated/operations";

import type { LexemeResult } from "../components/lexeme-card";
import type { LexemeFormRow } from "../components/lexeme-forms";
import type { LexemeInflection } from "../components/lexeme-header";
import type { LexemeMatchInfo } from "../components/lexeme-match";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type { ReactNode } from "react";

// ♟️ Constants

/**
 * Where the lexico API serves GraphQL when `LEXICO_API_URL` is not set.
 */
const DEFAULT_LEXICO_API_URL = "http://localhost:5003/graphql";

/**
 * The most lexemes one language's search is asked for.
 */
const SEARCH_PAGE_SIZE = 24;

const searchSchema = z.object({ query: z.string().optional() });
const connectionSchema = z.object({
  edges: z.array(z.object({ node: z.custom<ResultNode>() })),
});

// 🏷️ Types

/**
 * What the API answers a query with.
 */
interface ApiResponse {
  data?: unknown;
  errors?: { message: string }[];
}

/**
 * One form of a lexeme as the GraphQL API returns it: the grammar of the form
 * beside its kind.
 */
interface FormNode {
  form: Omit<LexemeFormRow, "id" | "kind" | "word"> & { __typename: string };
  id: string;
  word: string;
}

/**
 * Relay connection edges carrying nodes of one shape.
 */
interface NodeEdges<Node> {
  edges: { node: Node }[];
}

/**
 * One result as the GraphQL API returns it.
 */
interface ResultNode {
  enclitic: null | string;
  identifiers: string[];
  lexeme: {
    etymology: null | string;
    id: string;
    inflection: LexemeInflection | null;
    lemma: string;
    partOfSpeech: string;
    principalParts: NodeEdges<{ text: string[] }>;
    pronunciations: NodeEdges<{
      phonetic: null | string;
      variant: string;
    }> | null;
    translations: NodeEdges<{ data: string }> | null;
    wordForms: NodeEdges<FormNode> | null;
  };
  score: number;
  source: string;
}

/**
 * The search parameters the route's URL carries.
 */
type SearchParameters = z.infer<typeof searchSchema>;

// 🛰️ Server Functions

/**
 * Says how a search matched a lexeme from the tier the API ranked it in. The
 * API scores every Latin tier differently and calls a match on part of a
 * headword "fuzzy", though it is a substring match, so how far off one is means
 * how many letters the headword has beyond the query. English matches all come
 * back as full-text matches, and only their score says whether a translation
 * was exactly the query, started with it, or merely mentioned it.
 */
function describeMatch(match: {
  lemma: string;
  query: string;
  score: number;
  source: string;
}): LexemeMatchInfo {
  const { lemma, query, score, source } = match;
  const letters = lemma.normalize("NFD").replaceAll(/\p{Diacritic}/gu, "");
  const extraLetters = Math.max(0, letters.length - query.length);

  switch (source) {
    case "ENCLITIC": {
      return { kind: "enclitic" };
    }
    case "LEMMA_EXACT": {
      return { kind: "exact-headword" };
    }
    case "PREFIX": {
      return { extraLetters, kind: "prefix" };
    }
    case "TRANSLATION_FULLTEXT": {
      if (score >= 1) {
        return { kind: "translation-exact" };
      }

      return { kind: score >= 0.8 ? "translation-prefix" : "translation-text" };
    }
    case "WORD_EXACT": {
      return { kind: "exact-form" };
    }
    default: {
      return { extraLetters, kind: "contains" };
    }
  }
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
 * Searches English through the lexico API and returns the results it matched.
 */
async function searchEnglish(query: string): Promise<ResultNode[]> {
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

/**
 * Searches Latin through the lexico API and returns the results it matched.
 */
async function searchLatin(query: string): Promise<ResultNode[]> {
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
function toLexemeInflection(
  inflection: LexemeInflection | null,
): LexemeInflection | null {
  if (inflection === null) {
    return inflection;
  }
  return inflection;
}

/**
 * Searches the dictionary in Latin and in English at once, since a query is
 * not labeled with the language it is written in, and merges what both find,
 * best match first. A lexeme both searches found keeps its higher score.
 */
const getSearch = createServerFunction({ method: "GET" })
  .validator(z.object({ query: z.string() }))
  .handler(async ({ data }): Promise<LexemeResult[]> => {
    const query = data.query.trim();

    if (query === "") {
      return [];
    }

    const [latin, english] = await Promise.all([
      searchLatin(query),
      searchEnglish(query),
    ]);
    const best = lodash.uniqBy(
      lodash.orderBy([...latin, ...english], "score", "desc"),
      "lexeme.id",
    );

    return best.map(({ enclitic, identifiers, lexeme, score, source }) => ({
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
        lemma: lexeme.lemma,
        query: query.toLowerCase(),
        score,
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
  });

// 🧭 Route

/**
 * Searches the dictionary in Latin and English at once, showing the lexemes a
 * query matched, best first.
 */
export const Route = createFileRoute("/search")({
  component: SearchPage,
  errorComponent: SearchError,
  head: ({ match }) => {
    const { query } = match.search;

    return {
      meta: [
        {
          title:
            query === undefined
              ? "Lexico - Search"
              : `Lexico - Search: ${query}`,
        },
        {
          content: `Search Latin and English${query === undefined ? "" : ` for ${query}`} translations, principal parts, part of speech, and other grammatical information`,
          name: "description",
        },
        {
          content: `Latin, English${query === undefined ? "" : `, ${query}`}, translation, grammar, principal parts, part of speech`,
          name: "keywords",
        },
      ],
    };
  },
  loader: async ({ deps }: { deps: { query: string } }) =>
    getSearch({ data: { query: deps.query } }),
  loaderDeps: ({ search }: { search: SearchParameters }) => ({
    query: search.query ?? "",
  }),
  validateSearch: searchSchema,
});

// 🧩 Component

/**
 * What the page shows when the API cannot answer, with a way to ask again.
 */
function SearchError(): ReactNode {
  const { invalidate } = useRouter();

  return (
    <section className="space-y-4 text-center">
      <h1 className="sr-only">Search</h1>
      <p className="text-muted-foreground">Search is unavailable right now.</p>
      <Button
        onClick={() => {
          void invalidate();
        }}
        variant="outline"
      >
        Try again
      </Button>
    </section>
  );
}

/**
 * The search page: a search bar over either the landing logo or the results.
 */
function SearchPage(): ReactNode {
  // 🪝 Hooks
  const navigate = Route.useNavigate();
  const { query = "" } = Route.useSearch();
  const results = Route.useLoaderData();
  const isLoading = useRouterState({
    select: (state: { isLoading: boolean }) => state.isLoading,
  });
  const formsByLexeme = useMemo(
    () =>
      new Map(
        results.map((result) => [result.id, result.forms ?? []] as const),
      ),
    [results],
  );

  // 🏗 Setup

  // 💪 Handlers
  const handleSearch = useCallback(
    (nextQuery: string): void => {
      void navigate({
        replace: true,
        search: nextQuery === "" ? {} : { query: nextQuery },
      });
    },
    [navigate],
  );
  const handleLoadForms = useCallback(
    async (lexemeId: string): Promise<LexemeFormRow[]> =>
      await Promise.resolve(formsByLexeme.get(lexemeId) ?? []),
    [formsByLexeme],
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="space-y-4">
      <h1 className="sr-only">Search</h1>
      <SearchBar
        initialQuery={query}
        isLoading={isLoading}
        onSearch={handleSearch}
      />
      {query === "" ? (
        <SearchLanding />
      ) : (
        <SearchResults
          loadForms={handleLoadForms}
          query={query}
          results={results}
        />
      )}
    </section>
  );
}
