import type { LexemeFormRow } from "../lexeme-forms/lexeme-forms.types";
import type { LexemeInflection } from "../lexeme-header/lexeme-header.types";

// 🏷️ Types

/**
 * What the API answers a query with.
 */
export interface ApiResponse {
  data?: unknown;
  errors?: { message: string }[];
}

/**
 * One result as the GraphQL API returns it.
 */
export interface ResultNode {
  distance: null | number;
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
export interface SearchParameters {
  query?: string | undefined;
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
