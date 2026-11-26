// 🏷️ Types

/**
 * A group or an event row, and its pill's width.
 */
export interface SkeletonTableRow {
  depth: number;
  id: string;
  kind: "event" | "group";
  width: string;
}
