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

/** Required value needing a terminal; `prompts` would silently exit 0. */
export const missingInputError = (subject: string): InputError =>
  new InputError(
    `${subject} is required, and stdin is not a terminal so it cannot be asked for.`,
  );

/** Dismissed prompt; escape is ordinary, not a crash. */
export const promptCancelledError = (subject: string): InputError =>
  new InputError(`${subject} was not chosen.`);
