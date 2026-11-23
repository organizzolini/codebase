// ♟️ Constants

import { compareRenderCommandHelpOptions } from "./render-command.utilities";

/** How a command's help sorts options: by flag. */
export const RENDER_COMMAND_HELP_CONFIGURATION = {
  compareOptions: compareRenderCommandHelpOptions,
  sortOptions: true,
};
