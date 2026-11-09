// ♟️ Constants

/**
 * Characters making a glob segment match more than its literal text.
 *
 * The literal prefix is walked directly, never the whole repository.
 */
export const GLOB_MAGIC_CHARACTERS = /[!*+?@[\]{}()]/;

/** Separator every relative path the walk produces uses, on every platform. */
export const PATH_SEPARATOR = "/";

// 🚨 Errors

/**
 * Raised when an input reaches beyond the repository holding it.
 *
 * An input may leave the measured folder, but reading outside the repository would let a shared action measure any file on the machine.
 */
export class InputOutsideRepositoryError extends Error {
  constructor(input: string, directory: string, boundary: string) {
    super(
      `Input "${input}" starts at ${directory}, which is outside ${boundary}. An input may reach out of the measured folder but not out of the repository holding it — write its directory relative to something inside.`,
    );
    this.name = "InputOutsideRepositoryError";
  }
}
