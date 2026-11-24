// 🏷️ Types

/**
 * What a header's menu can do; an action left out is disabled.
 */
export interface HeaderActions {
  onClearSort?: (() => void) | undefined;
  onMoveLeft?: (() => void) | undefined;
  onMoveRight?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  onSort?: ((direction: "asc" | "desc") => void) | undefined;
}
