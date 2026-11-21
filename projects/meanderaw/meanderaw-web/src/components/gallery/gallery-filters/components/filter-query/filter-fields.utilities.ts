import {
  MAXIMUM_REPEATS,
  MINIMUM_REPEATS,
} from "../../../../../hooks/use-gallery-search/use-gallery-search.constants";
import { humanizeCategory } from "../../../gallery-cascader/gallery-cascader.utilities";
import {
  DEFAULT_OPERATORS,
  REPEATS_FILTER_FIELD,
  ROWS_FILTER_FIELD,
} from "../filter-model/filter-model.constants";
import { describeField } from "../filter-model/filter-model.utilities";

import {
  BOOLEAN_FIELD_OPERATORS,
  NUMBER_FIELD_OPERATORS,
  REPEATS_FIELD_OPERATORS,
  TEXT_FIELD_OPERATORS,
  WHOLE_NUMBER_MESSAGE,
} from "./filter-query.constants";

import type { FilterField } from "../filter-model/filter-model.types";
import type {
  GalleryFilterField,
  GalleryFilterValue,
} from "./filter-query.types";
import type {
  FilterOperator,
  FilterValidateContext,
} from "@codebase/presentation";

// 🔏 Private Functions

/**
 * Builds the Filters component's fields: a branch per category, shape first,
 * each holding its fields; rows and repeats lead the shape.
 */
export function createFilterQueryFields(
  fields: readonly FilterField[],
): GalleryFilterField[] {
  const categories = new Map<string, GalleryFilterField[]>();
  const ordered = [ROWS_FILTER_FIELD, REPEATS_FILTER_FIELD, ...fields].toSorted(
    (left, right) =>
      rankCategory(left.category).localeCompare(rankCategory(right.category)),
  );

  for (const field of ordered) {
    const leaves = categories.get(field.category) ?? [];

    leaves.push(toQueryField(field));
    categories.set(field.category, leaves);
  }

  const branches: GalleryFilterField[] = [];

  for (const [category, leaves] of categories) {
    branches.push({
      fields: leaves,
      id: category,
      label: humanizeCategory(category),
    });
  }

  return branches;
}

/**
 * The operators a field takes: repeats only equals; each other kind its own.
 */
function operatorsOf(field: FilterField): FilterOperator[] {
  if (field.key === REPEATS_FILTER_FIELD.key) {
    return REPEATS_FIELD_OPERATORS;
  }

  if (field.type === "boolean") {
    return BOOLEAN_FIELD_OPERATORS;
  }

  return field.type === "text" ? TEXT_FIELD_OPERATORS : NUMBER_FIELD_OPERATORS;
}

/**
 * Orders a category: the shape fields first, then the catalog's by name.
 */
function rankCategory(category: string): string {
  return category === "shape" ? "" : category;
}

/**
 * The leaf the Filters component draws for a field; rows and repeats cannot be picked.
 */
function toQueryField(field: FilterField): GalleryFilterField {
  const isRequired =
    field.key === ROWS_FILTER_FIELD.key ||
    field.key === REPEATS_FILTER_FIELD.key;

  return {
    defaultOperator: DEFAULT_OPERATORS[field.type],
    description: describeField(field),
    id: field.key,
    label: field.label,
    operators: operatorsOf(field),
    type: field.type,
    ...(isRequired && { disabled: true }),
    ...(field.key === REPEATS_FILTER_FIELD.key && {
      validate: validateRepeats,
    }),
    ...(field.isInteger &&
      field.key !== REPEATS_FILTER_FIELD.key && {
        validate: validateWholeNumbers,
      }),
  };
}

/**
 * Refuses a repeats value that is no whole number from the least to the most.
 */
function validateRepeats(
  context: FilterValidateContext<GalleryFilterValue>,
): string | undefined {
  return context.values.every(
    (value) =>
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= MINIMUM_REPEATS &&
      value <= MAXIMUM_REPEATS,
  )
    ? undefined
    : `Repeats run from ${String(MINIMUM_REPEATS)} to ${String(MAXIMUM_REPEATS)}.`;
}

// 🌎 Public Functions

/**
 * Refuses a fraction for a field that counts whole things.
 */
function validateWholeNumbers(
  context: FilterValidateContext<GalleryFilterValue>,
): string | undefined {
  return context.values.every(
    (value) => typeof value !== "number" || Number.isSafeInteger(value),
  )
    ? undefined
    : WHOLE_NUMBER_MESSAGE;
}
