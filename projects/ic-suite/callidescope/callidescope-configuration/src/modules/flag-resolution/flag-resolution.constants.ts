// ♟️ Constants

import { CALLIDESCOPE_OUTPUT_FORMATS } from "../configuration/configuration.constants";
import { InputError } from "../input/input.constants";

// 🚫 Refusals

// A deliberate misspelling: the example of a `--format` value nobody
// recognizes, which is exactly what this refusal is about.
// cspell:ignore mermiad

/** Refuses an unknown `--format`, rather than silently printing markdown. */
export const buildUnknownFormatMessage = (value: string): string =>
  `--format does not accept "${value}". It takes one of ${CALLIDESCOPE_OUTPUT_FORMATS.map(
    (format) => `"${format}"`,
  ).join(", ")}.`;

/** Refuses a path flag supplying an undeclared destination, bypassing completeness. */
export const buildUndeclaredDestinationMessage = (args: {
  field: string;
  flag: string;
}): string =>
  `${args.flag} overrides a destination the configuration does not declare. Add \`${args.field}\` to the configuration this run reads, then use ${args.flag} to send it somewhere else.`;

/** Refuses switch values other than true or false, never guessing. */
export const buildUnknownSwitchMessage = (args: {
  flag: string;
  value: string;
}): string =>
  `${args.flag} does not accept "${args.value}". It takes "true" or "false", or the flag on its own for "true".`;

/** Refuses an unreadable limit rather than keep the configured one. */
export const buildUnreadableCountMessage = (args: {
  flag: string;
  value: string;
}): string =>
  `${args.flag} does not accept "${args.value}". It takes a positive whole number.`;

/** Refuses a `--maximum-breadth` with no configured value to change. */
export const buildUndeclaredValueMessage = (args: {
  field: string;
  flag: string;
}): string =>
  `${args.flag} overrides a value the configuration does not declare. Add \`${args.field}\` to the configuration this run reads, then use ${args.flag} to change it.`;

/** Joins flag mistakes into one `InputError`: one event to callers. */
export const flagResolutionError = (reasons: readonly string[]): InputError =>
  new InputError(reasons.join(" "));
