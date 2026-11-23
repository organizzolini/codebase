// 🌎 Utilities

import { maskPostgresCredentials } from "../postgresql-utilities/postgresql-utilities.utilities";

import {
  GraphOptionsError,
  graphPositiveIntegerMessage,
} from "./graph-options.constants";

/**
 * `error` again, with its message's password masked, so a connection failure
 * never shows the password it was made with.
 */
export function maskedError(error: unknown, password: string): Error {
  const message = error instanceof Error ? error.message : String(error);
  const masked = new Error(maskPostgresCredentials(message, password));
  masked.name = error instanceof Error ? error.name : Error.name;
  return masked;
}

/**
 * The number a cap flag's text names, or `undefined` when the flag is absent.
 * @throws GraphOptionsError naming `flag` and the text when it is not a positive integer.
 */
export function positiveIntegerFlag(
  flag: string,
  value: string | undefined,
): number | undefined {
  if (value === undefined) return undefined;
  if (!/^[1-9]\d*$/u.test(value)) {
    throw new GraphOptionsError(graphPositiveIntegerMessage(flag, value));
  }
  return Number(value);
}
