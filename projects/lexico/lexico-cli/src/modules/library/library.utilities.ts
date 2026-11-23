import { createHash } from "node:crypto";

import _ from "lodash";

import {
  MAXIMUM_SLUG_SEGMENT_LENGTH,
  MAXIMUM_TITLE_LENGTH,
  SLUG_HASH_LENGTH,
} from "./library.constants";

import type { TextCollection } from "@codebase/lexico-db";

/**
 * Clean up common Latin Library boilerplate patterns.
 */
export function cleanBoilerplate(text: string): string {
  let cleaned = text;

  // Remove various forms of The Latin Library / The Classics Page boilerplate
  cleaned = cleaned.replaceAll(/The Latin Library/gi, "");
  cleaned = cleaned.replaceAll(/The Classics Page/gi, "");
  cleaned = cleaned.replaceAll(/Neo-Latin/gi, "");

  return cleaned.trim();
}

/**
 * Format line numbers consistently.
 */
export function formatLineNumber(line: string): string {
  let formattedLine = line.trim();

  // If the line has an end-of-line poetry number padded with whitespace
  // Move it to the beginning and bold it.
  const endLineMatch = /^(.*?)\s{3,}(\d+)\s*$/.exec(formattedLine);
  if (endLineMatch) {
    formattedLine = `**${endLineMatch[2]}** ${endLineMatch[1]}`.trim();
  } else {
    // Check if the line already starts with bold text, if so skip prefixes formatting
    if (!formattedLine.startsWith("**")) {
      const bracketMatch = /^\[([a-zA-Z0-9]+)\]\s*(.*)$/.exec(formattedLine);
      const decimalMatch = /^((?:\d+\.)+[a-zA-Z0-9]*\.?)\s+(.*)$/.exec(
        formattedLine,
      );
      const simpleMatch = /^(\d+[a-zA-Z]*|[MDCLXVI]+)\.?\s+(.*)$/.exec(
        formattedLine,
      );

      if (bracketMatch) {
        formattedLine = `**[${bracketMatch[1]}]** ${bracketMatch[2]}`;
      } else if (decimalMatch) {
        formattedLine = `**${decimalMatch[1]}** ${decimalMatch[2]}`;
      } else if (simpleMatch) {
        formattedLine = `**${simpleMatch[1]}** ${simpleMatch[2]}`;
      }
    }
  }

  // Double check if there's any case where end of line number was already bolded but at the end
  const boldEndLineMatch = /^(.*?)\s{2,}\*\*(\d+)\*\*\s*$/.exec(formattedLine);
  if (boldEndLineMatch) {
    formattedLine = `**${boldEndLineMatch[2]}** ${boldEndLineMatch[1]}`.trim();
  }

  return formattedLine;
}

/**
 * Check if the text content is valid Latin (not English metadata/intro).
 */
export function hasValidTextContent(paragraphs: string[]): boolean {
  if (paragraphs.length === 0) return false;

  const allText = paragraphs.join(" ");
  // Check if there is at least one alphabetical character in the combined text
  return /[a-zA-Z]/.test(allText);
}

/**
 * Identify English boilerplate text.
 */
export function isEnglishBoilerplate(line: string): boolean {
  const stopWords = new Set([
    "and",
    "by",
    "from",
    "of",
    "that",
    "the",
    "this",
    "to",
    "which",
    "with",
  ]);
  const words = line.toLowerCase().match(/\b[a-z]+\b/g) || [];
  if (words.length === 0) return false;

  let stopWordCount = 0;
  for (const word of words) {
    if (stopWords.has(word)) stopWordCount++;
  }

  // If a significant portion of words are english stop words, it's english text.
  return (
    stopWordCount >= 3 ||
    (words.length > 5 && stopWordCount / words.length > 0.2)
  );
}

/**
 * Pulls the typed Text attributes out of extracted source metadata, leaving the rest.
 */
export function splitTextAttributes(
  collection: TextCollection,
  metadata: Record<string, string | string[] | undefined>,
): { attributes: Record<string, unknown>; remaining: Record<string, unknown> } {
  const {
    cts_urn: workIdentifier,
    edition,
    editors,
    print_publication_date: printDate,
    publisher,
    ...remaining
  } = metadata;
  const printYear =
    typeof printDate === "string" ? /\d{4}/.exec(printDate)?.[0] : undefined;
  const attributes = _.omitBy(
    {
      collection,
      edition,
      editors: Array.isArray(editors) ? editors.join(", ") : editors,
      print_year: printYear === undefined ? undefined : Number(printYear),
      publisher,
      work_identifier: workIdentifier,
    },
    (value) => value === undefined,
  );
  return { attributes, remaining };
}

/** Kebab-cases a name into a slug segment of at most 40 characters, cutting at a word boundary and adding a short hash. */
export function toBoundedSlug(name: string): string {
  const slug = _.kebabCase(name);
  if (slug.length <= MAXIMUM_SLUG_SEGMENT_LENGTH) return slug;
  const hash = createHash("sha1")
    .update(slug)
    .digest()
    .readUInt32BE(0)
    .toString(36)
    .padStart(SLUG_HASH_LENGTH, "0")
    .slice(-SLUG_HASH_LENGTH);
  const length = MAXIMUM_SLUG_SEGMENT_LENGTH - SLUG_HASH_LENGTH - 1;
  const boundary = slug.slice(0, length + 1).lastIndexOf("-");
  const prefix = slug.slice(0, boundary > 0 ? boundary : length);
  return `${prefix}-${hash}`;
}

/**
 * Cuts a title to the 128 characters the text table stores, at a word
 * boundary, marking the cut with an ellipsis.
 */
export function toBoundedTitle(title: string): string {
  if (title.length <= MAXIMUM_TITLE_LENGTH) return title;
  const length = MAXIMUM_TITLE_LENGTH - 1;
  const boundary = title.slice(0, length + 1).lastIndexOf(" ");
  return `${title.slice(0, boundary > 0 ? boundary : length).trimEnd()}…`;
}
