import { buttonVariants } from "@codebase/presentation";

// ♟️ Constants

/**
 * The plain outline look of the range, a segment that only reads.
 */
export const RANGE_SEGMENT = buttonVariants({
  className: "pointer-events-none tabular-nums",
  size: "sm",
  variant: "outline",
});
