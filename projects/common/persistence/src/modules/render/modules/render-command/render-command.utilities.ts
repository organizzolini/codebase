// 🌎 Utilities

import type { RenderCommandHelpOption } from "./render-command.types";

/** Orders help options by long flag, `--help` last, as a subclass's own options register before inherited ones. */
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
