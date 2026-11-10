// ♟️ Constants

/**
 * Thrown when a command line cannot be turned into a run. One class rather than one per cause:
 * every cause means nothing ran and the flags need retyping. Only the wording varies, by the
 * factories below. Sits here because the constants rule whitelists error classes.
 */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

/**
 * A required value that cannot be asked for without a terminal. `prompts` would
 * exit 0 having done nothing, so this refuses instead.
 */
export const missingInputError = (subject: string): InputError =>
  new InputError(
    `${subject} is required, and stdin is not a terminal so it cannot be asked for.`,
  );

/**
 * A prompt dismissed without an answer. Worded apart from an unrecognized
 * answer, since escape is ordinary, not a crash.
 */
export const promptCancelledError = (subject: string): InputError =>
  new InputError(`${subject} was not chosen.`);
