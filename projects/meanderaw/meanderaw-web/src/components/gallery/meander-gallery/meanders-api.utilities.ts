import { print } from "graphql";
import { z } from "zod";

import {
  CharacteristicsDocument,
  MeanderGroupsDocument,
  MeandersDocument,
} from "../../../graphql/generated/operations";
import { toSortInput } from "../../../hooks/use-gallery-search/use-gallery-search.utilities";
import { toFilterInput } from "../gallery-filters/components/filter-model/filter-model.utilities";
import { MAXIMUM_GROUP_LEVELS } from "../gallery-group-by/gallery-group-by.constants";
import { fitsGrouping } from "../gallery-group-by/gallery-group-by.utilities";

import {
  DEFAULT_MEANDERAW_API_URL,
  GALLERY_PAGE_SIZE,
  groupNodeSchema,
  responseSchema,
} from "./meanders-api.constants";

import type {
  MeanderGroupsQueryVariables,
  MeandersQueryVariables,
} from "../../../graphql/generated/operations";
import type { SortEntry } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type {
  FilterGroup,
  RowsFilter,
} from "../gallery-filters/components/filter-model/filter-model.types";
import type {
  GalleryCharacteristic,
  GalleryGroup,
  MeandersPage,
} from "./meanders-api.types";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

// 🌎 Public Functions

/**
 * Reads the characteristic catalog, which names the fields a sort may use.
 */
export async function findCharacteristics(): Promise<GalleryCharacteristic[]> {
  const { characteristics } = await queryApi(CharacteristicsDocument, {});

  return characteristics;
}

/**
 * Reads the groups of a grouped page, whose cards come later, or the
 * first page of a flat one.
 */
export async function findGallery(
  request: Readonly<{
    filter: FilterGroup | undefined;
    grouping: readonly string[];
    repeats: number;
    rows: RowsFilter;
    size: number;
    sorts: readonly SortEntry[];
  }>,
): Promise<{
  groups: GalleryGroup[] | undefined;
  page: MeandersPage | undefined;
}> {
  const { filter, grouping, repeats, rows, size, sorts } = request;

  if (grouping.length > 0) {
    if (!fitsGrouping(filter, grouping)) {
      throw new Error(
        "This filter is too large to read the cards of its groups; remove a rule or a group level.",
      );
    }

    return {
      groups: await findMeanderGroups({
        filter: toFilterInput(filter, rows),
        groupBy: grouping.map((field) => ({ field })),
      }),
      page: undefined,
    };
  }

  return {
    groups: undefined,
    page: await findMeanders({
      filter: toFilterInput(filter, rows),
      first: size,
      repeats,
      sort: toSortInput(sorts),
    }),
  };
}

/**
 * Reads the groups the levels split the filtered meanders into, with exact
 * counts.
 */
export async function findMeanderGroups(
  variables: Readonly<MeanderGroupsQueryVariables>,
): Promise<GalleryGroup[]> {
  const { meanderGroups } = await queryApi(MeanderGroupsDocument, variables);

  return parseGroups(
    meanderGroups,
    [variables.groupBy].flat().map(({ field }) => field),
  );
}

/**
 * Reads one page of meanders, from the start or after a cursor, each drawn
 * with its tile repeated as asked.
 */
export async function findMeanders(
  variables: Readonly<MeandersQueryVariables>,
): Promise<MeandersPage> {
  const { meanders } = await queryApi(MeandersDocument, {
    ...variables,
    first: variables.first ?? GALLERY_PAGE_SIZE,
  });

  return meanders;
}

/**
 * Checks the groups sent against the levels asked for. The last level asked
 * is the leaf, whether or not `groups` is there.
 */
export function parseGroups(
  raw: unknown,
  levels: readonly string[],
): GalleryGroup[] {
  if (levels.length === 0 || levels.length > MAXIMUM_GROUP_LEVELS) {
    throw new Error("A grouping holds one to four levels");
  }

  const roots: GalleryGroup[] = [];
  let current = [{ children: raw, into: roots }];

  for (const [index, field] of levels.entries()) {
    const next: typeof current = [];

    for (const { children, into } of current) {
      for (const child of z.array(groupNodeSchema).parse(children)) {
        if (child.field !== field) {
          throw new Error(
            `A group of ${child.field} came in place of ${field}`,
          );
        }

        const group: GalleryGroup = {
          count: child.count,
          field,
          groups: [],
          value: child.value,
        };

        into.push(group);

        if (index < levels.length - 1) {
          next.push({
            children: z.array(z.unknown()).parse(child.groups),
            into: group.groups,
          });
        }
      }
    }

    current = next;
  }

  return roots;
}

/**
 * Posts a typed document to the API, returning its data or throwing the first
 * error it answers with.
 */
export async function queryApi<
  TResult,
  TVariables extends Record<string, unknown>,
>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const environment: Record<string, unknown> = import.meta.env;
  const url = z
    .string()
    .min(1)
    .catch(DEFAULT_MEANDERAW_API_URL)
    .parse(environment["VITE_MEANDERAW_API_URL"]);
  const response = await fetch(url, {
    body: JSON.stringify({ query: print(document), variables }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const body = responseSchema.parse(await response.json());

  if (body.errors?.[0] !== undefined) {
    throw new Error(body.errors[0].message);
  }

  return z.custom<TResult>().parse(body.data);
}
