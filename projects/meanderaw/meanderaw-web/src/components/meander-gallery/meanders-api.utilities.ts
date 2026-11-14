import { print } from "graphql";
import { z } from "zod";

import {
  CharacteristicsDocument,
  MeanderGroupsDocument,
  MeandersDocument,
} from "../../graphql/generated/operations";
import { toSortInput } from "../../hooks/use-gallery-search/use-gallery-search.utilities";
import { toFilterInput } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import {
  DEFAULT_MEANDERAW_API_URL,
  GALLERY_PAGE_SIZE,
  responseSchema,
} from "./meanders-api.constants";

import type {
  MeanderGroupsQueryVariables,
  MeandersQueryVariables,
} from "../../graphql/generated/operations";
import type { SortDirection } from "../../hooks/use-gallery-search/use-gallery-search.types";
import type { FilterGroup } from "../gallery-filter-builder/gallery-filter-builder.types";
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
    direction: SortDirection;
    filter: FilterGroup | undefined;
    grouping: readonly string[];
    sort: string | undefined;
  }>,
): Promise<{
  groups: GalleryGroup[] | undefined;
  page: MeandersPage | undefined;
}> {
  const { direction, filter, grouping, sort } = request;

  if (grouping.length > 0) {
    return {
      groups: await findMeanderGroups({
        filter: toFilterInput(filter),
        groupBy: grouping.map((field) => ({ field })),
      }),
      page: undefined,
    };
  }

  return {
    groups: undefined,
    page: await findMeanders({
      filter: toFilterInput(filter),
      sort: toSortInput(sort, direction),
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

  return meanderGroups;
}

/**
 * Reads one page of meanders, from the start or after a cursor.
 */
export async function findMeanders(
  variables: Readonly<Omit<MeandersQueryVariables, "first">> = {},
): Promise<MeandersPage> {
  const { meanders } = await queryApi(MeandersDocument, {
    ...variables,
    first: GALLERY_PAGE_SIZE,
  });

  return meanders;
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
