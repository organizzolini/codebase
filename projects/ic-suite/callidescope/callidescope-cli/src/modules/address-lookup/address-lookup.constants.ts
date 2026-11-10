// ♟️ Constants

import {
  ProjectConfigurationError,
  ProjectConfigurationFieldNotPermittedError,
} from "@callidescope/configuration";

/** The advice for an address that matched nothing; one sentence, since it appears under typed and declared addresses alike. */
export const ADDRESS_NOT_FOUND_ADVICE =
  "Check the file path and the qualified name callidescope prints for it in a stack.";

/** Headline an address a lookup could not act on is reported under. */
export const REJECTED_ADDRESS = "🔭 Rejected a callable address";

/** Whether an error is a project's own refused configuration, not a callidescope fault. A free function, since mocked services decide nothing. */
export const isRefusedProjectConfiguration = (
  error: unknown,
): error is
  | ProjectConfigurationError
  | ProjectConfigurationFieldNotPermittedError =>
  error instanceof ProjectConfigurationError ||
  error instanceof ProjectConfigurationFieldNotPermittedError;
