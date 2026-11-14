// 🏷️ Types

/** What one level groups by, once its field is read. */
export type GroupLevel =
  | { readonly field: ShapeGroupField; readonly kind: "shape" }
  | {
      readonly field: string;
      readonly id: number;
      readonly isBoolean: boolean;
      readonly kind: "characteristic";
    };

/** A shape field a level may name besides a characteristic key. */
export type ShapeGroupField = "isHardcoded" | "lattice" | "rowsColumns";
