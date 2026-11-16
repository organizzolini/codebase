import { notFound } from "@tanstack/react-router";

import { TextReaderDocument } from "../../graphql/generated/operations";
import { queryApi } from "../search-results/search.utilities";

import { READER_PAGE_SIZE } from "./reader-lines-api.constants";

import type {
  GetTextInput,
  LineConnection,
  ReaderText,
} from "./reader-lines.types";

// 🔏 Private Functions

/**
 * Names a text for a history entry: its parent work, then its own title.
 */
export function describeOrigin(text: Readonly<ReaderText>): string {
  return text.parentText === null
    ? text.title
    : `${text.parentText.title}, ${text.title}`;
}

/**
 * Makes the router answer not found, for a loader that has no text to show.
 */
export function failNotFound(): never {
  notFound({ throw: true });
  throw new Error("notFound did not throw");
}

// 🌎 Public Functions

/**
 * Finds a text and a page of its lines. Given a line, keeps loading forward
 * pages until that line is in the result or the lines run out.
 */
export async function findText(
  input: Readonly<GetTextInput>,
): Promise<null | ReaderText> {
  const { after, line, slug } = input;
  const first = await queryApi(TextReaderDocument, {
    after: after ?? null,
    first: READER_PAGE_SIZE,
    slug,
  });
  let { text } = first;

  while (
    text !== null &&
    line !== undefined &&
    text.lines.pageInfo.hasNextPage &&
    !reaches(text.lines, line)
  ) {
    const next = await queryApi(TextReaderDocument, {
      after: text.lines.pageInfo.endCursor,
      first: READER_PAGE_SIZE,
      slug,
    });

    if (next.text === null) {
      break;
    }

    text = { ...text, lines: mergeLines(text.lines, next.text.lines) };
  }

  return text;
}

/**
 * Appends a later page of lines to the lines loaded so far.
 */
export function mergeLines(
  loaded: LineConnection,
  next: LineConnection,
): LineConnection {
  return {
    edges: [...loaded.edges, ...next.edges],
    pageInfo: next.pageInfo,
  };
}

/**
 * Whether the loaded lines reach the given line index.
 */
function reaches(lines: LineConnection, line: number): boolean {
  return lines.edges.some((edge) => edge.node.index >= line);
}
