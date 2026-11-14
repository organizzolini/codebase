import { graphql, HttpResponse } from "msw";

import { serveGraphqlApi } from "./graphql-api";

import type { GalleryMeander } from "../src/components/meander-gallery/meanders-api.types";
import type {
  MeandersQuery,
  MeandersQueryVariables,
} from "../src/graphql/generated/operations";

/**
 * A test's mock API: what it was asked, and a switch that makes it fail.
 */
export interface MeandersApi {
  /**
   * Makes every read fail with the message, until `recover`.
   */
  fail: (message: string) => void;
  recover: () => void;
  requests: MeandersQueryVariables[];
}

/**
 * The meander at a place in the fixture: every third one is hardcoded and
 * holds the `isChain` pattern, and each holds a junction count.
 */
export function fixtureMeander(index: number): GalleryMeander {
  const code = `01x01y${String(index).padStart(4, "0")}`;
  const isChain = index % 3 === 0;

  return {
    characteristics: [
      ...(isChain ? [{ isPattern: true, key: "isChain", value: 1 }] : []),
      { isPattern: false, key: "junctionCount", value: (index % 4) + 1 },
    ],
    code,
    columns: (index % 3) + 1,
    id: `id-${String(index).padStart(4, "0")}`,
    isHardcoded: isChain,
    lattice: index % 2 === 0 ? "0" : "1",
    repeats: 1,
    rows: (index % 5) + 1,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>${code}</title></svg>`,
  };
}

/**
 * Serves `count` fixture meanders over the `Meanders` query, paged by cursor
 * the way the API pages them, and hands back what a test needs to watch it.
 */
export function serveMeandersApi(count = 3): MeandersApi {
  let failure: string | undefined;
  const api: MeandersApi = {
    fail: (message) => {
      failure = message;
    },
    recover: () => {
      failure = undefined;
    },
    requests: [],
  };

  serveGraphqlApi(
    graphql.query<MeandersQuery, MeandersQueryVariables>(
      "Meanders",
      ({ variables }) => {
        api.requests.push(variables);

        if (failure !== undefined) {
          return HttpResponse.json({ errors: [{ message: failure }] });
        }

        const start =
          variables.after === null || variables.after === undefined
            ? 0
            : Number(variables.after) + 1;
        const end = Math.min(start + (variables.first ?? 50), count);
        const edges = Array.from({ length: end - start }, (_, offset) => ({
          cursor: String(start + offset),
          node: fixtureMeander(start + offset),
        }));

        return HttpResponse.json({
          data: {
            meanders: {
              edges,
              pageInfo: {
                endCursor: edges.at(-1)?.cursor ?? null,
                hasNextPage: end < count,
              },
              totalCount: count,
            },
          },
        });
      },
    ),
  );

  return api;
}
