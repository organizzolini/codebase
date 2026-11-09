// ♟️ Constants

import { CALLIDESCOPE_OUTPUT_FORMATS } from "../configuration/configuration.constants";
import { InputError } from "../input/input.constants";

// 🚫 Refusals

// A deliberate misspelling: the example of a `--format` value nobody
// recognizes, which is exactly what this refusal is about.
// cspell:ignore mermiad

/** Refuses an unknown `--format` rather than silently printing markdown, which would teach the flag does nothing. */
export const buildUnknownFormatMessage = (value: string): string =>
  `--format does not accept "${value}". It takes one of ${CALLIDESCOPE_OUTPUT_FORMATS.map(
    (format) => `"${format}"`,
  ).join(", ")}.`;

/** Refuses a path flag that would supply a destination the configuration never declared, bypassing the completeness rule. */
export const buildUndeclaredDestinationMessage = (args: {
  field: string;
  flag: string;
}): string =>
  `${args.flag} overrides a destination the configuration does not declare. Add \`${args.field}\` to the configuration this run reads, then use ${args.flag} to send it somewhere else.`;

/** Refuses a switch value other than true or false, since guessing would trace or skip tests on a typo. */
export const buildUnknownSwitchMessage = (args: {
  flag: string;
  value: string;
}): string =>
  `${args.flag} does not accept "${args.value}". It takes "true" or "false", or the flag on its own for "true".`;

/** Refuses an unreadable limit rather than dropping it, which would leave the configured number silently in force. */
export const buildUnreadableCountMessage = (args: {
  flag: string;
  value: string;
}): string =>
  `${args.flag} does not accept "${args.value}". It takes a positive whole number.`;

/** Refuses a `--maximum-breadth` that would supply a value no configuration chose; a flag may only change a declared one. */
export const buildUndeclaredValueMessage = (args: {
  field: string;
  flag: string;
}): string =>
  `${args.flag} overrides a value the configuration does not declare. Add \`${args.field}\` to the configuration this run reads, then use ${args.flag} to change it.`;

/** Joins every flag mistake into one `InputError`, since to a caller it is one event: retype the flags. */
export const flagResolutionError = (reasons: readonly string[]): InputError =>
  new InputError(reasons.join(" "));
