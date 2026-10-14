import {
  createFileRoute,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { createServerFn as createServerFunction } from "@tanstack/react-start";
import lodash from "lodash";
import { useCallback } from "react";
import { z } from "zod";

import { Button } from "@codebase/components-web";

import { SearchBar } from "../components/search-bar";
import { SearchLanding } from "../components/search-landing";
import { SearchResults } from "../components/search-results";

import type { LexemeResult } from "../components/lexeme-card";
import type { ReactNode } from "react";

// ♟️ Constants

/**
 * Where the lexico API serves GraphQL when `LEXICO_API_URL` is not set.
 */
const DEFAULT_LEXICO_API_URL = "http://localhost:8398/graphql";

/**
 * The most lexemes one language's search is asked for.
 */
const SEARCH_PAGE_SIZE = 24;

/**
 * What a search selects of each result, the same for either language.
 */
const SEARCH_SELECTION = `
  edges {
    node {
      score
      lexeme {
        id
        lemma
        partOfSpeech
        principalParts { text }
        translations { data }
      }
    }
  }
`;

const searchSchema = z.object({ query: z.string().optional() });

// 🏷️ Types

/**
 * One result as the GraphQL API returns it.
 */
interface ResultNode {
  lexeme: {
    id: string;
    lemma: string;
    partOfSpeech: string;
    principalParts: { text: string[] }[];
    translations: null | { data: string }[];
  };
  score: number;
}

/**
 * The search parameters the route's URL carries.
 */
type SearchParameters = z.infer<typeof searchSchema>;

/**
 * A search query's GraphQL response.
 */
interface SearchResponse {
  data?: Record<string, undefined | { edges: { node: ResultNode }[] }>;
  errors?: { message: string }[];
}

// 🛰️ Server Functions

/**
 * Searches Latin or English through the lexico API, which exposes each as its
 * own query, and returns the results it matched.
 */
async function searchLanguage(
  field: "searchEnglish" | "searchLatin",
  query: string,
): Promise<ResultNode[]> {
  const response = await fetch(
    process.env["LEXICO_API_URL"] ?? DEFAULT_LEXICO_API_URL,
    {
      body: JSON.stringify({
        query: `query ($query: String!, $first: Int!) { ${field}(query: $query, first: $first) { ${SEARCH_SELECTION} } }`,
        variables: { first: SEARCH_PAGE_SIZE, query },
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    },
  );
  const body = (await response.json()) as SearchResponse;

  if (body.errors?.[0] !== undefined) {
    throw new Error(body.errors[0].message);
  }

  return body.data?.[field]?.edges.map((edge) => edge.node) ?? [];
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
      searchLanguage("searchLatin", query),
      searchLanguage("searchEnglish", query),
    ]);
    const best = lodash.uniqBy(
      lodash.orderBy([...latin, ...english], "score", "desc"),
      "lexeme.id",
    );

    return best.map(({ lexeme }) => ({
      id: lexeme.id,
      lemma: lexeme.lemma,
      partOfSpeech: lexeme.partOfSpeech,
      principalParts: lexeme.principalParts.flatMap((part) =>
        part.text.slice(0, 1),
      ),
      translations: (lexeme.translations ?? []).map(
        (translation) => translation.data,
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
  const router = useRouter();

  return (
    <section className="space-y-4 text-center">
      <h1 className="sr-only">Search</h1>
      <p className="text-muted-foreground">Search is unavailable right now.</p>
      <Button
        onClick={() => {
          void router.invalidate();
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

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="space-y-8">
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
          query={query}
          results={results}
        />
      )}
    </section>
  );
}
