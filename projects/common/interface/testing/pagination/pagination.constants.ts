import type { PageRequest } from "./pagination.types";

/**
 * Page counts covering `first`, `last`, both together, zero, and the negative
 * counts the original slicing read as no limit.
 */
export const FULL_LIMITS: readonly PageRequest[] = [
  {},
  { first: 0 },
  { first: 2 },
  { first: -1 },
  { last: 0 },
  { last: 2 },
  { last: -1 },
  { first: 2, last: 1 },
];

/** The counts a quick matrix keeps: none, `first`, and `last`. */
export const QUICK_LIMITS: readonly PageRequest[] = [
  {},
  { first: 2 },
  { last: 2 },
];
