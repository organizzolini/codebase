// ♟️ Constants

/**
 * Option names that configure the generator, not its inputs. `name` is absent
 * since most generators take a `name` input; `--template` selects instead.
 */
export const RESERVED_GENERATOR_OPTION_NAMES = new Set([
  "config",
  "help",
  "instancePath",
  "template",
]);

/**
 * The `validate --templates` value meaning every template. Supplying it skips
 * the prompt omitting it would show; no template may use this name.
 */
export const ALL_TEMPLATES_SELECTION = "all";

/** Subcommand token stripped from raw arguments before option scanning. */
export const GENERATE_COMMAND_TOKEN = "generate";

/**
 * Thrown when a command line cannot be turned into a run.
 *
 * One class rather than one per cause: every cause is the same event to
 * whoever catches it — nothing was generated, and the fix is to retype the
 * flags. Only the wording varies, which is what the factory below does.
 */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

/**
 * Input that cannot be asked for: stdin is not a terminal. `prompts` would hang
 * and exit 0, so the message names the flag.
 */
export const missingInputError = (inputName: string): InputError =>
  new InputError(
    `${inputName} is required, and stdin is not a terminal so it cannot be asked for. Pass --${inputName}.`,
  );

/**
 * Refuses a run that gives no output directory. Both hosts share these words;
 * `hint` carries a remedy only one host has.
 */
export const missingDirectoryError = (args: {
  generatorName: string | undefined;
  hint?: string;
}): InputError => {
  const subject =
    args.generatorName === undefined
      ? "This generator"
      : `Generator ${args.generatorName}`;

  return new InputError(
    `${subject} cannot tell where to write its output. Pass --directory=<parent folder> (the folder the output is created inside).${args.hint === undefined ? "" : ` ${args.hint}`}`,
  );
};
