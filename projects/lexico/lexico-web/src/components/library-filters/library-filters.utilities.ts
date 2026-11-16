import { z } from "zod";

import { libraryFilterShape } from "../library-grid/library-grid-api.constants";

import {
  LIBRARY_CHECKBOX_FILTERS,
  LIBRARY_LIST_FILTERS,
  LIBRARY_RANGE_FILTERS,
} from "./library-filters.constants";

import type { LibraryFilterParameters } from "../library-grid/library-grid.types";
import type { LibraryFilterDraft } from "./library-filters.types";

// 🔏 Private Functions

/**
 * What is wrong with the range bounds a form holds: a bound that is not a
 * whole number, or a minimum above its maximum. Each is worded for a reader.
 */
export function draftErrors(draft: Readonly<LibraryFilterDraft>): string[] {
  const errors: string[] = [];

  for (const { key, label } of LIBRARY_RANGE_FILTERS) {
    const bounds = (["Minimum", "Maximum"] as const).map((end) => {
      const text = (draft.text[`${key}${end}`] ?? "").trim();
      const value = Number(text);
      const isBad = text !== "" && !Number.isInteger(value);
      if (isBad) {
        errors.push(`${label} ${end.toLowerCase()} must be a whole number.`);
      }
      return text === "" || isBad ? undefined : value;
    });
    const [minimum, maximum] = bounds;
    if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
      errors.push(`${label} minimum is greater than its maximum.`);
    }
  }

  return errors;
}

/**
 * Reads the filters a filled-in form describes, dropping what is empty or invalid.
 */
export function fromDraft(
  draft: Readonly<LibraryFilterDraft>,
): LibraryFilterParameters {
  const raw: Record<string, unknown> = { ...draft.selected };

  for (const { key } of LIBRARY_LIST_FILTERS) {
    raw[key] = toList(draft.text[key]);
  }
  for (const { key } of LIBRARY_RANGE_FILTERS) {
    raw[`${key}Minimum`] = toNumber(draft.text[`${key}Minimum`]);
    raw[`${key}Maximum`] = toNumber(draft.text[`${key}Maximum`]);
  }

  return z.object(libraryFilterShape).parse(raw);
}

// 🌎 Public Functions

/**
 * Fills the filter form from the filters the URL carries.
 */
export function toDraft(
  filters: Readonly<LibraryFilterParameters>,
): LibraryFilterDraft {
  const selected: Record<string, string[]> = {};
  const text: Record<string, string> = {};

  for (const { key } of LIBRARY_CHECKBOX_FILTERS) {
    selected[key] = filters[key] ?? [];
  }
  for (const { key } of LIBRARY_LIST_FILTERS) {
    text[key] = (filters[key] ?? []).join(", ");
  }
  for (const { key } of LIBRARY_RANGE_FILTERS) {
    text[`${key}Minimum`] = String(filters[`${key}Minimum`] ?? "");
    text[`${key}Maximum`] = String(filters[`${key}Maximum`] ?? "");
  }

  return { selected, text };
}

/** The non-empty entries of a comma-separated list. */
function toList(text: string | undefined): string[] {
  return (text ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

/** A typed number, or undefined when the box is empty or not a number. */
function toNumber(text: string | undefined): number | undefined {
  return text === undefined || text.trim() === "" ? undefined : Number(text);
}
