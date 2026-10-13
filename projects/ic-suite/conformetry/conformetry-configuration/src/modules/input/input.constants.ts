// ♟️ Constants

/**
 * Option names that select or configure the generator itself, rather than
 * feeding one of its inputs.
 *
 * `name` is deliberately absent: nearly every generator takes a `name` input,
 * and reserving the flag made it impossible to supply from the CLI. The
 * template is selected with `--template` instead.
 */
export const RESERVED_GENERATOR_OPTION_NAMES = new Set([
  "config",
  "help",
  "instancePath",
  "template",
]);

/**
 * How a caller says "every template" to `validate --templates`.
 *
 * A sentinel rather than a second flag, because supplying a value is how this
 * command line opts out of being prompted: omitting `--templates` in a
 * terminal asks, and passing `all` decides without narrowing. It lives beside
 * the other command-line vocabulary because that is what it is — the word a
 * caller types — and `assertNoCollisions` reads it from here so a template can
 * never be named the same thing.
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
 * A required input that cannot be asked for, because stdin is not a terminal.
 *
 * `prompts` does not fail there — it draws its menu, never resolves, and the
 * process exits 0 having done nothing, which is exactly how this CLI used to
 * hang in non-interactive environments. Naming the flag to pass is the whole
 * remedy, so the message carries it.
 */
export const missingInputError = (inputName: string): InputError =>
  new InputError(
    `${inputName} is required, and stdin is not a terminal so it cannot be asked for. Pass --${inputName}.`,
  );

/**
 * A run that names no directory, and has nothing else to place its output by.
 *
 * Both hosts refuse this with the same words, which is why it lives here: the
 * command-line host always needs `--directory`, and the Nx plugin needs it
 * only when no `project` or `type` locates the output, so each decides when to
 * raise it and neither words it. A silent fallback is what this replaces —
 * output written somewhere the caller never chose, reported as success. The
 * optional `hint` carries a remedy only one host has.
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
