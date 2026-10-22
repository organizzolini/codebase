import type { EventFilterValue } from "./event-filters.types";

// A rule's value comes from the builder or from a link someone may have
// edited by hand, so each reader keeps only what its field can use and
// answers "nothing" for the rest, which leaves the rule out of the query.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

/**
 * Reads a pair of `YYYY-MM-DD` days in order, or `null`.
 */
export function readDateRange(
  value: EventFilterValue | undefined,
): [string, string] | null {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }

  const [from, to] = value;

  if (
    typeof from !== "string" ||
    typeof to !== "string" ||
    !DATE_PATTERN.test(from) ||
    !DATE_PATTERN.test(to) ||
    from > to
  ) {
    return null;
  }

  return [from, to];
}

/**
 * Reads a pair of whole numbers from `minimum` to `maximum` in order, or
 * `null`.
 */
export function readIntegerRange(
  value: EventFilterValue | undefined,
  bounds: Readonly<{ maximum: number; minimum: number }>,
): [number, number] | null {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }

  const [from, to] = value;

  if (
    typeof from !== "number" ||
    typeof to !== "number" ||
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < bounds.minimum ||
    to > bounds.maximum ||
    from > to
  ) {
    return null;
  }

  return [from, to];
}

/**
 * Reads a list of whole numbers from `minimum` to `maximum`, written as
 * numbers or as the strings an option list holds, distinct and in order of
 * first appearance. An empty list means the rule is unfinished.
 */
export function readIntegers(
  value: EventFilterValue | undefined,
  bounds: Readonly<{ maximum: number; minimum: number }>,
): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const integers = new Set<number>();

  for (const item of value) {
    const integer = item === null || item === "" ? Number.NaN : Number(item);

    if (
      Number.isInteger(integer) &&
      integer >= bounds.minimum &&
      integer <= bounds.maximum
    ) {
      integers.add(integer);
    }
  }

  return [...integers];
}

/**
 * Reads a list of distinct non-empty strings, dropping anything else.
 */
export function readTexts(value: EventFilterValue | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const texts = new Set<string>();

  for (const item of value) {
    if (typeof item === "string" && item !== "") {
      texts.add(item);
    }
  }

  return [...texts];
}
