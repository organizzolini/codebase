// ♟️ Constants

import { InputError } from "@conformetry/configuration";

/**
 * No template was supplied or chosen. The names are in the message for callers
 * without the picker, such as CI.
 */
export const missingTemplateError = (
  availableTemplateNames: readonly string[],
): InputError =>
  new InputError(
    `No template was selected. Pass --template. Available: ${availableTemplateNames.join(", ")}`,
  );
