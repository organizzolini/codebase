import { NUMBER_OPERATORS } from "./event-filters.constants";

export const COMPARISONS: Readonly<Record<string, string>> = {
  [NUMBER_OPERATORS.eq]: "=",
  [NUMBER_OPERATORS.gt]: ">",
  [NUMBER_OPERATORS.gte]: ">=",
  [NUMBER_OPERATORS.lt]: "<",
  [NUMBER_OPERATORS.lte]: "<=",
  [NUMBER_OPERATORS.neq]: "=",
};

/**
 * A number as a rule may write it: an optional sign, digits with an optional
 * fraction or a fraction alone, and an optional exponent, with spaces around.
 */
export const NUMBER_PATTERN =
  /^\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*$/iu;
