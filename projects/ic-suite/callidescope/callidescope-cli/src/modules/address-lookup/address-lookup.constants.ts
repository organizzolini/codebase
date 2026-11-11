// ♟️ Constants

import {
  ProjectConfigurationError,
  ProjectConfigurationFieldNotPermittedError,
} from "@callidescope/configuration";

/** Advice for an address matching nothing, typed or declared. */
export const ADDRESS_NOT_FOUND_ADVICE =
  "Check the file path and the qualified name callidescope prints for it in a stack.";

/** Headline an address a lookup could not act on is reported under. */
export const REJECTED_ADDRESS = "🔭 Rejected a callable address";

/** Whether an error is a project's refused configuration, not a bug. */
export const isRefusedProjectConfiguration = (
  error: unknown,
): error is
  | ProjectConfigurationError
  | ProjectConfigurationFieldNotPermittedError =>
  error instanceof ProjectConfigurationError ||
  error instanceof ProjectConfigurationFieldNotPermittedError;
