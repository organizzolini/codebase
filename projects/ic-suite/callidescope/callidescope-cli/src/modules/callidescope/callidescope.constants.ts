// ♟️ Constants

import {
  ConfigurationPathRequiredError,
  InputError,
} from "@callidescope/configuration";
import { ProgramConfigurationError } from "@callidescope/graph";

import { isRefusedProjectConfiguration } from "../address-lookup/address-lookup.constants";

/** Whether a `new` expression pushes a frame; constructors do real work. */
export const INCLUDE_CONSTRUCTOR_EDGES = true;

// 🚫 Refusals

/** Headline a command line the input service refused is reported under. */
export const REJECTED_COMMAND_LINE = "🔭 Rejected the command line";

/** Headline a project whose `tsconfig.json` could not be read is reported under. */
export const REJECTED_PROJECT = "🔭 Rejected a project it could not read";

/** Headline a project's own refused configuration file is reported under. */
export const REJECTED_PROJECT_CONFIGURATION =
  "🔭 Rejected a project configuration";

/** Refuses a bare argument, which would otherwise trace the workspace. */
export const buildUnknownCommandMessage = (name: string): string =>
  `${name} is not a callidescope command, and the trace takes no positional arguments. Run one of depth, breadth, or limits, or drop the argument to trace the workspace.`;

/** The headline a refused error is reported under, or nothing. */
export const readRefusalHeadline = (error: unknown): string | undefined => {
  if (error instanceof ProgramConfigurationError) {
    return REJECTED_PROJECT;
  }

  if (
    isRefusedProjectConfiguration(error) ||
    error instanceof UnresolvedEntryPointAddressError
  ) {
    return REJECTED_PROJECT_CONFIGURATION;
  }

  return error instanceof InputError ||
    error instanceof ConfigurationPathRequiredError
    ? REJECTED_COMMAND_LINE
    : undefined;
};

// 🚨 Errors

/**
 * Raised when a declared `entryPoints.addresses` entry names no callable, or more than one.
 *
 * Fatal to the whole run: a root dropped without a word would silently lower a measured depth.
 *
 * Takes finished sentences rather than addresses; `CallidescopeCommand` writes them.
 */
export class UnresolvedEntryPointAddressError extends Error {
  constructor(descriptions: readonly string[]) {
    super(UnresolvedEntryPointAddressError.joinDescriptions(descriptions));
    this.name = "UnresolvedEntryPointAddressError";
  }

  /**
   * Joins one sentence per unresolved address into one refusal, numbered so each
   * problem is distinct. A lone problem stays unnumbered.
   */
  private static joinDescriptions(descriptions: readonly string[]): string {
    const [only] = descriptions;

    if (only !== undefined && descriptions.length === 1) {
      return only;
    }

    const numbered = descriptions
      .map((description, index) => `(${String(index + 1)}) ${description}`)
      .join(" ");

    return `${String(descriptions.length)} declared entry points did not resolve. ${numbered}`;
  }
}
