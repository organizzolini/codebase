// ♟️ Constants

import { InputError } from "@conformetry/configuration";

/** No template given or chosen; names are listed for non-interactive callers. */
export const missingTemplateError = (
  availableTemplateNames: readonly string[],
): InputError =>
  new InputError(
    `No template was selected. Pass --template. Available: ${availableTemplateNames.join(", ")}`,
  );
