import { Injectable } from "@nestjs/common";

import { DATE_PATTERN, NUMBER_PATTERN } from "./event-filter-values.constants";

// A rule's values come from the builder or a hand-edited link, so each reader
// keeps only what its field can use and answers "nothing" for the rest, which
// leaves the rule out of the query.

/**
 * Reads the values a rule was given, keeping what its field can use.
 */
@Injectable()
export class EventFilterValuesService {
  /**
   * Reads a whole number written as digits with an optional sign, or `NaN`.
   */
  private readInteger(value: string): number {
    return /^\s*[+-]?\d+\s*$/u.test(value) ? Number(value) : Number.NaN;
  }

  /**
   * Reads a pair of `YYYY-MM-DD` days in order, or `null`.
   */
  public readDateRange(values: readonly string[]): [string, string] | null {
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
  public readIntegerRange(
    values: readonly string[],
    bounds: Readonly<{ maximum: number; minimum: number }>,
  ): [number, number] | null {
    const [first, second] = values;

    if (values.length !== 2 || first === undefined || second === undefined) {
      return null;
    }

    const from = this.readInteger(first);
    const to = this.readInteger(second);

    // `NaN` fails every comparison, so a value that is no integer reads as
    // outside the bounds.
    return from >= bounds.minimum && to <= bounds.maximum && from <= to
      ? [from, to]
      : null;
  }

  /**
   * Reads distinct whole numbers in bounds, in first-appearance order.
   */
  public readIntegers(
    values: readonly string[],
    bounds: Readonly<{ maximum: number; minimum: number }>,
  ): number[] {
    const integers = new Set<number>();

    for (const value of values) {
      const integer = this.readInteger(value);

      if (integer >= bounds.minimum && integer <= bounds.maximum) {
        integers.add(integer);
      }
    }

    return [...integers];
  }

  /**
   * Reads a range of two numbers in order, or `null` when unusable.
   */
  public readNumberRange(values: readonly string[]): [number, number] | null {
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
  public readSingleNumber(values: readonly string[]): [number] | null {
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
  public readTexts(values: readonly string[]): string[] {
    return [...new Set(values.filter((value) => value !== ""))];
  }
}
