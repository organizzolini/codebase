import { print } from "graphql";
import { z } from "zod";

import { MeandersDocument } from "../../graphql/generated/operations";

import {
  DEFAULT_MEANDERAW_API_URL,
  GALLERY_PAGE_SIZE,
  responseSchema,
} from "./meanders-api.constants";

import type { MeandersQueryVariables } from "../../graphql/generated/operations";
import type { MeandersPage } from "./meanders-api.types";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

// 🌎 Public Functions

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
