// ♟️ Constants

/**
 * Raised when a run names no callidescope configuration file.
 *
 * There is no default location and nothing is searched for, so the path must
 * come from the caller. The message names the surface that should have carried
 * it — the command-line flag, the executor option, or the plugin option — so
 * the reader is told which of the three to fix.
 */
export class ConfigurationPathRequiredError extends Error {
  constructor(surface: string) {
    super(
      `${surface} is required and names the callidescope configuration file. Nothing is searched for, so a missing or blank value is refused.`,
    );
    this.name = "ConfigurationPathRequiredError";
  }
}

/**
 * Thrown when a command line cannot be turned into a run. One class covers every cause,
 * since each means: retype the flags.
 */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

/** Refuses a required value that cannot be asked for, since a prompt on a non-terminal exits 0 having done nothing. */
export const missingInputError = (subject: string): InputError =>
  new InputError(
    `${subject} is required, and stdin is not a terminal so it cannot be asked for.`,
  );

/** A prompt dismissed without an answer. Worded apart from an unrecognized answer, since escape is ordinary. */
export const promptCancelledError = (subject: string): InputError =>
  new InputError(`${subject} was not answered.`);
