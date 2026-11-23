import { delay, graphql, HttpResponse } from "msw";

import { refuseFilter } from "./filter-api-contract";
import { serveGraphqlApi } from "./graphql-api";

import type {
  GalleryGroup,
  GalleryMeander,
} from "../src/components/gallery/meander-gallery/meanders-api.types";
import type {
  CharacteristicsQuery,
  CharacteristicsQueryVariables,
  MeanderFilterGroupInput,
  MeanderFilterRuleInput,
  MeanderGroupsQueryVariables,
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
  /**
   * Makes only the reads of meanders fail, until `recover`.
   */
  failMeanders: (message: string) => void;
  groupRequests: MeanderGroupsQueryVariables[];
  recover: () => void;
  requests: MeandersQueryVariables[];
}

/** How many rows each fixture meander has, until a test says otherwise. */
let fixtureRows = (_index: number): number => 4;

/**
 * A group as sent; the fourth level has no `groups`.
 */
type RawGroup = Omit<GalleryGroup, "groups"> & { groups?: RawGroup[] };

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
    rows: fixtureRows(index),
    svg: `<svg data-repeats="${repeats}" width="${40 * repeats}" height="40" viewBox="0 0 ${40 * repeats} 40" xmlns="http://www.w3.org/2000/svg"><title>${code}</title></svg>`,
  };
}

/**
 * The catalog the fixture meanders are measured by.
 */
export const FIXTURE_CHARACTERISTICS: CharacteristicsQuery["characteristics"] =
  [
    {
      category: "submatrix",
      description: "Holds a chain.",
      isPattern: true,
      key: "isChain",
      meanderCount: 3,
      name: "Chain",
      valueCounts: [{ meanderCount: 3, value: 1 }],
      valueType: "boolean",
    },
    {
      category: "path",
      description: "Pieces of ink.",
      isPattern: false,
      key: "junctionCount",
      meanderCount: 8,
      name: "Junction count",
      valueCounts: [
        { meanderCount: 2, value: 1 },
        { meanderCount: 2, value: 2 },
      ],
      valueType: "number",
    },
  ];

/**
 * Serves `count` fixture meanders over `Meanders`, paged by cursor as the API
 * does, and returns a handle to watch it.
 */
export function serveMeandersApi(
  count = 3,
  delayMs = 0,
  rowsOf: (index: number) => number = () => 4,
): MeandersApi {
  fixtureRows = rowsOf;
  let failure: string | undefined;
  let meandersFailure: string | undefined;
  const api: MeandersApi = {
    fail: (message) => {
      failure = message;
    },
    failMeanders: (message) => {
      meandersFailure = message;
    },
    groupRequests: [],
    recover: () => {
      failure = undefined;
      meandersFailure = undefined;
    },
    requests: [],
  };

  serveGraphqlApi(
    graphql.query<MeandersQuery, MeandersQueryVariables>(
      "Meanders",
      async ({ variables }) => {
        api.requests.push(variables);
        await delay(delayMs);

        const message =
          failure ?? meandersFailure ?? refuseInput(variables.filter);

        if (message !== undefined) {
          return HttpResponse.json({ errors: [{ message }] });
        }

        const start =
          (variables.after === null || variables.after === undefined
            ? 0
            : Number(variables.after) + 1) + (variables.offset ?? 0);
        const positions = sortedPositions(count, variables.sort).filter(
          (position) =>
            variables.filter === null ||
            variables.filter === undefined ||
            matchesGroup(fixtureMeander(position), variables.filter),
        );
        const end = Math.min(start + (variables.first ?? 50), positions.length);
        const edges = positions.slice(start, end).map((position, offset) => ({
          cursor: String(start + offset),
          node: fixtureMeander(position, variables.repeats ?? 1),
        }));

        return HttpResponse.json({
          data: {
            meanders: {
              edges,
              pageInfo: {
                endCursor: edges.at(-1)?.cursor ?? null,
                hasNextPage: end < positions.length,
              },
              totalCount: positions.length,
            },
          },
        });
      },
    ),
    // The generated result stops at four levels; the groups here nest freely.
    graphql.query<{ meanderGroups: RawGroup[] }, MeanderGroupsQueryVariables>(
      "MeanderGroups",
      ({ variables }) => {
        api.groupRequests.push(variables);

        if (failure !== undefined) {
          return HttpResponse.json({ errors: [{ message: failure }] });
        }

        const fixtures = Array.from({ length: count }, (_, position) =>
          fixtureMeander(position),
        ).filter(
          (meander) =>
            variables.filter === null ||
            variables.filter === undefined ||
            matchesGroup(meander, variables.filter),
        );

        return HttpResponse.json({
          data: {
            meanderGroups: groupMeanders(
              fixtures,
              [variables.groupBy].flat().map(({ field }) => field),
            ),
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
 * The key a meander falls under at a level.
 */
function groupKey(meander: GalleryMeander, field: string): string {
  if (field === "rowsColumns") {
    return `${String(meander.rows)}x${String(meander.columns)}`;
  }

  const held = sortValue(meander, field);
  const isBoolean =
    field === "isHardcoded" ||
    FIXTURE_CHARACTERISTICS.find(({ key }) => key === field)?.valueType ===
      "boolean";

  return isBoolean ? String(Boolean(held)) : String(held);
}

/**
 * Splits meanders into groups level by level with exact counts, in numeric
 * key order, a missing characteristic being its own 0 or false group.
 */
function groupMeanders(
  meanders: readonly GalleryMeander[],
  fields: readonly string[],
  depth = 1,
): RawGroup[] {
  const [field, ...rest] = fields;

  if (field === undefined) {
    return [];
  }

  const buckets = new Map<string, GalleryMeander[]>();

  for (const meander of meanders) {
    const key = groupKey(meander, field);

    buckets.set(key, [...(buckets.get(key) ?? []), meander]);
  }

  return [...buckets.entries()]
    .toSorted(([left], [right]) =>
      left.localeCompare(right, "en", { numeric: true }),
    )
    .map(([value, members]) => ({
      count: members.length,
      field,
      // The query reads four levels, so the fourth has no `groups` field.
      ...(depth < 4 ? { groups: groupMeanders(members, rest, depth + 1) } : {}),
      value,
    }));
}

/**
 * Whether a meander satisfies a group of the API's filter input, a missing
 * characteristic reading 0 or false.
 */
function matchesGroup(
  meander: GalleryMeander,
  group: MeanderFilterGroupInput,
): boolean {
  const results = [
    ...(group.rules ?? []).map((rule) => matchesRule(meander, rule)),
    ...(group.groups ?? []).map((nested) => matchesGroup(meander, nested)),
  ];

  return group.combinator === "AND"
    ? results.every(Boolean)
    : results.some(Boolean);
}

/**
 * Whether a meander satisfies one rule of the API's filter input.
 */
function matchesRule(
  meander: GalleryMeander,
  rule: MeanderFilterRuleInput,
): boolean {
  const held = sortValue(meander, rule.field);
  const [low = 0, high = 0] = rule.numbers ?? [];
  const compared = rule.text ?? low;

  switch (rule.operator) {
    case "BETWEEN": {
      return Number(held) >= low && Number(held) <= high;
    }
    case "EQ": {
      return held === compared;
    }
    case "GT": {
      return Number(held) > low;
    }
    case "GTE": {
      return Number(held) >= low;
    }
    case "IS": {
      return Boolean(held) === rule.flag;
    }
    case "IS_NOT": {
      return Boolean(held) !== rule.flag;
    }
    case "LT": {
      return Number(held) < low;
    }
    case "LTE": {
      return Number(held) <= low;
    }
    case "NE": {
      return held !== compared;
    }
  }
}

/**
 * Why the API would refuse the filter an operation carries, if it would.
 */
function refuseInput(
  filter: MeanderFilterGroupInput | null | undefined,
): string | undefined {
  return filter === null || filter === undefined
    ? undefined
    : refuseFilter(filter);
}

/**
 * Fixture positions in the order of the sorts, first to last, ties by
 * position; position order with no sort.
 */
function sortedPositions(
  count: number,
  sort: MeanderSortInput | MeanderSortInput[] | null | undefined,
): number[] {
  const positions = Array.from({ length: count }, (_, position) => position);
  const sorts = sort === null || sort === undefined ? [] : [sort].flat();

  return positions.toSorted((left, right) => {
    for (const { direction, field } of sorts) {
      const a = sortValue(fixtureMeander(left), field);
      const b = sortValue(fixtureMeander(right), field);

      if (a !== b) {
        return (direction === "DESC" ? -1 : 1) * (a < b ? -1 : 1);
      }
    }

    return left - right;
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
