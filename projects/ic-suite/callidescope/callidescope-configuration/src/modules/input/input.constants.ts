// ♟️ Constants

/**
 * Raised when a run names no callidescope configuration file.
 *
 * No default location is searched, so the path must come from the caller. The message names the flag, executor option, or plugin option that should have carried it.
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

/** Refuses a prompt on a non-terminal, which exits 0 silently. */
export const missingInputError = (subject: string): InputError =>
  new InputError(
    `${subject} is required, and stdin is not a terminal so it cannot be asked for.`,
  );

/** Prompt dismissed without an answer, unlike a wrong answer. */
export const promptCancelledError = (subject: string): InputError =>
  new InputError(`${subject} was not answered.`);
