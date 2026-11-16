import { delay, graphql, HttpResponse } from "msw";

import { serveGraphqlApi } from "./graphql-api";

import type { GalleryMeander } from "../src/components/meander-gallery/meanders-api.types";
import type {
  CharacteristicsQuery,
  CharacteristicsQueryVariables,
  MeanderSortInput,
  MeandersQuery,
  MeandersQueryVariables,
} from "../src/graphql/generated/operations";

/**
 * A test's mock API: its requests, and a failure switch.
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
export function fixtureMeander(index: number, repeats = 1): GalleryMeander {
  const code = `01x01y${String(index).padStart(4, "0")}`;
  const isChain = index % 3 === 0;

  return {
    characteristics: [
      ...(isChain
        ? [{ isPattern: true, key: "isChain", name: "Chain", value: 1 }]
        : []),
      {
        isPattern: false,
        key: "junctionCount",
        name: "Junction count",
        value: (index % 4) + 1,
      },
    ],
    code,
    columns: (index % 3) + 1,
    id: `id-${String(index).padStart(4, "0")}`,
    isHardcoded: isChain,
    lattice: index % 2 === 0 ? "0" : "1",
    repeats: 1,
    rows: (index % 5) + 1,
    svg: `<svg data-repeats="${repeats}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>${code}</title></svg>`,
  };
}

/**
 * The catalog the fixture meanders are measured by.
 */
export const FIXTURE_CHARACTERISTICS: CharacteristicsQuery["characteristics"] =
  [
    { isPattern: true, key: "isChain", name: "Chain", valueType: "boolean" },
    {
      isPattern: false,
      key: "junctionCount",
      name: "Junction count",
      valueType: "number",
    },
  ];

/**
 * Serves `count` fixture meanders over `Meanders`, paged by cursor as the API
 * does, and returns a handle to watch it.
 */
export function serveMeandersApi(count = 3, delayMs = 0): MeandersApi {
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
      async ({ variables }) => {
        api.requests.push(variables);
        await delay(delayMs);

        if (failure !== undefined) {
          return HttpResponse.json({ errors: [{ message: failure }] });
        }

        const start =
          variables.after === null || variables.after === undefined
            ? 0
            : Number(variables.after) + 1;
        const end = Math.min(start + (variables.first ?? 50), count);
        const edges = sortedPositions(count, variables.sort)
          .slice(start, end)
          .map((position, offset) => ({
            cursor: String(start + offset),
            node: fixtureMeander(position, variables.repeats ?? 1),
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
    graphql.query<CharacteristicsQuery, CharacteristicsQueryVariables>(
      "Characteristics",
      () =>
        failure === undefined
          ? HttpResponse.json({
              data: { characteristics: FIXTURE_CHARACTERISTICS },
            })
          : HttpResponse.json({ errors: [{ message: failure }] }),
    ),
  );

  return api;
}

/**
 * Fixture positions in a sort's order, ties by position; position order
 * with no sort.
 */
function sortedPositions(
  count: number,
  sort: MeanderSortInput | null | undefined,
): number[] {
  const positions = Array.from({ length: count }, (_, position) => position);

  if (sort === null || sort === undefined) {
    return positions;
  }

  const sign = sort.direction === "DESC" ? -1 : 1;

  return positions.toSorted((left, right) => {
    const a = sortValue(fixtureMeander(left), sort.field);
    const b = sortValue(fixtureMeander(right), sort.field);

    return a === b ? left - right : sign * (a < b ? -1 : 1);
  });
}

/**
 * What a meander holds for a sort field; a characteristic not held reads
 * 0.
 */
function sortValue(meander: GalleryMeander, field: string): number | string {
  const shape: Partial<Record<string, number | string>> = {
    code: meander.code,
    columns: meander.columns,
    isHardcoded: Number(meander.isHardcoded),
    lattice: meander.lattice,
    repeats: meander.repeats,
    rows: meander.rows,
  };

  return (
    shape[field] ??
    meander.characteristics.find(({ key }) => key === field)?.value ??
    0
  );
}
