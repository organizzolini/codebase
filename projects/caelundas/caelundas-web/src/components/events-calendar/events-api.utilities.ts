import { print } from "graphql";
import { z } from "zod";

import {
  DEFAULT_CAELUNDAS_API_URL,
  responseSchema,
} from "./events-api.constants";

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

// 🌎 Public Functions

/**
 * Runs one typed GraphQL operation against the Caelundas API and returns its
 * data, throwing the first error the API reports.
 */
export async function queryApi<
  TResult,
  TVariables extends Record<string, unknown>,
>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const response = await fetch(readApiUrl(), {
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

/**
 * Reads the API's address from the `VITE_CAELUNDAS_API_URL` build variable,
 * falling back to the local default.
 */
export function readApiUrl(): string {
  const environment: Record<string, unknown> = import.meta.env;
  const configured = z
    .string()
    .min(1)
    .safeParse(environment["VITE_CAELUNDAS_API_URL"]);

  return configured.success ? configured.data : DEFAULT_CAELUNDAS_API_URL;
}
