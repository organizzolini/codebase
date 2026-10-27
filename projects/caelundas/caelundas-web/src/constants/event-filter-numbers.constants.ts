import { NUMBER_OPERATORS } from "./event-filters.constants";

export const COMPARISONS: Readonly<Record<string, string>> = {
  [NUMBER_OPERATORS.eq]: "=",
  [NUMBER_OPERATORS.gt]: ">",
  [NUMBER_OPERATORS.gte]: ">=",
  [NUMBER_OPERATORS.lt]: "<",
  [NUMBER_OPERATORS.lte]: "<=",
  [NUMBER_OPERATORS.neq]: "=",
};
