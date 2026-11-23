// ♟️ Constants

import { compareRenderCommandHelpOptions } from "./render-command.utilities";

/**
 * How a render command's help lists its options: sorted by flag. Commander
 * reads `compareOptions` at runtime, though its typings leave it out.
 */
export const RENDER_COMMAND_HELP_CONFIGURATION = {
  compareOptions: compareRenderCommandHelpOptions,
  sortOptions: true,
};
