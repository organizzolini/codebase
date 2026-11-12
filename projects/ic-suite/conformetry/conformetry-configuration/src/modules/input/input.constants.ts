// ♟️ Constants

/** Options that configure the generator, not its inputs. */
export const RESERVED_GENERATOR_OPTION_NAMES = new Set([
  "config",
  "help",
  "instancePath",
  "template",
]);

/** `validate --templates` value for every template; none may use it. */
export const ALL_TEMPLATES_SELECTION = "all";

/** Subcommand token stripped from raw arguments before option scanning. */
export const GENERATE_COMMAND_TOKEN = "generate";

/**
 * Thrown when a command line cannot become a run.
 *
 * One class for every cause: each means nothing was generated, and the fix is
 * to retype the flags. Only the wording varies, via the factory below.
 */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

/** Input needing a terminal; piped stdin would hang the prompt. */
export const missingInputError = (inputName: string): InputError =>
  new InputError(
    `${inputName} is required, and stdin is not a terminal so it cannot be asked for. Pass --${inputName}.`,
  );

/** Refuses a run with no output directory, for both hosts. */
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
