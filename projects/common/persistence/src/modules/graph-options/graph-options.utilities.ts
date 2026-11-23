// 🌎 Utilities

import { maskPostgresCredentials } from "../postgresql-utilities/postgresql-utilities.utilities";

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
