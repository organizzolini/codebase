// 🌎 Utilities

import type { RenderCommandHelpOption } from "./render-command.types";

/**
 * Orders options in a command's help by long flag, with `--help` last. A
 * subclass's own options are registered before the ones it inherits, so
 * without it the help would list them first.
 */
export function compareRenderCommandHelpOptions(
  left: RenderCommandHelpOption,
  right: RenderCommandHelpOption,
): number {
  const leftHelp = left.long === "--help";
  const rightHelp = right.long === "--help";
  if (leftHelp !== rightHelp) return leftHelp ? 1 : -1;
  const leftLong = left.long ?? "";
  const rightLong = right.long ?? "";
  if (leftLong === rightLong) return 0;
  return leftLong < rightLong ? -1 : 1;
}
