import type { LibraryGroupField } from "../../../graphql/generated/operations";
import type { LucideIcon } from "lucide-react";

// 🏷️ Types

/** A groupable attribute's field, wording, and icon. */
export interface LibraryGroupOption {
  field: LibraryGroupField;
  icon: LucideIcon;
  label: string;
}
