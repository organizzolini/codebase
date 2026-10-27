import {
  createFileRoute,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { Button } from "@codebase/presentation";

import { SearchBar } from "../components/search-bar";
import { SearchLanding } from "../components/search-landing";
import { SearchResults } from "../components/search-results";
import { getSearch, searchSchema } from "../constants/search.constants";

import type { LexemeFormRow } from "../components/lexeme-forms.types";
import type { SearchParameters } from "../types/search.types";
import type { ReactNode } from "react";

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
