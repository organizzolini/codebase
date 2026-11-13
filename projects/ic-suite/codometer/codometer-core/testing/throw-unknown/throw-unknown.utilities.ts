/**
 * Throws any value, typed `unknown` to avoid the lint rule requiring an `Error`, so tests can reach non-`Error` catch branches.
 */
export function throwUnknown(value: unknown): never {
  throw value;
}
