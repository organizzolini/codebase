import { DATE_PATTERN, NUMBER_PATTERN } from "./event-filter-values.constants";

// A rule's values come from the builder or a hand-edited link, so each reader
// keeps only what its field can use and answers "nothing" for the rest, which
// leaves the rule out of the query.

/**
 * Reads a pair of `YYYY-MM-DD` days in order, or `null`.
 */
export function readDateRange(
  values: readonly string[],
): [string, string] | null {
  const [from, to] = values;

  if (
    values.length !== 2 ||
    from === undefined ||
    to === undefined ||
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
  values: readonly string[],
  bounds: Readonly<{ maximum: number; minimum: number }>,
): [number, number] | null {
  const [first, second] = values;

  if (values.length !== 2 || first === undefined || second === undefined) {
    return null;
  }

  const from = readInteger(first);
  const to = readInteger(second);

  // `NaN` fails every comparison, so a value that is no integer reads as
  // outside the bounds.
  return from >= bounds.minimum && to <= bounds.maximum && from <= to
    ? [from, to]
    : null;
}

/**
 * Reads a list of whole numbers from `minimum` to `maximum`, distinct and in
 * order of first appearance. An empty list means the rule is unfinished.
 */
export function readIntegers(
  values: readonly string[],
  bounds: Readonly<{ maximum: number; minimum: number }>,
): number[] {
  const integers = new Set<number>();

  for (const value of values) {
    const integer = readInteger(value);

    if (integer >= bounds.minimum && integer <= bounds.maximum) {
      integers.add(integer);
    }
  }

  return [...integers];
}

/**
 * Reads the two ends of a range a rule was given, or `null` when either is
 * not written as a number or they run backwards.
 */
export function readNumberRange(
  values: readonly string[],
): [number, number] | null {
  const [first, second] = values;

  if (
    values.length !== 2 ||
    first === undefined ||
    second === undefined ||
    !NUMBER_PATTERN.test(first) ||
    !NUMBER_PATTERN.test(second)
  ) {
    return null;
  }

  const from = Number(first);
  const to = Number(second);

  return from > to ? null : [from, to];
}

/**
 * Reads the one number a comparison was given, or `null` when it is not
 * written as one.
 */
export function readSingleNumber(values: readonly string[]): [number] | null {
  const [value] = values;

  return values.length !== 1 ||
    value === undefined ||
    !NUMBER_PATTERN.test(value)
    ? null
    : [Number(value)];
}

/**
 * Reads a list of distinct non-empty strings, dropping anything else.
 */
export function readTexts(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value !== ""))];
}

/**
 * Reads a whole number written as digits with an optional sign, or `NaN`.
 */
function readInteger(value: string): number {
  return /^\s*[+-]?\d+\s*$/u.test(value) ? Number(value) : Number.NaN;
}
