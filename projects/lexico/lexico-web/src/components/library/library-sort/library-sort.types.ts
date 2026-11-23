import type {
  LibrarySortDirection,
  LibrarySortField,
} from "../../../graphql/generated/operations";
import type { LucideIcon } from "lucide-react";

// 🏷️ Types

/** What a sort chip shows for its attribute: wording, and an icon when known. */
export interface LibrarySortDescription {
  icon?: LucideIcon | undefined;
  label: string;
}

/** One active sort: an attribute and the direction it orders in. */
export interface LibrarySortEntry {
  direction: LibrarySortDirection;
  field: LibrarySortField;
}

/** A sortable attribute's field, wording, and icon. */
export interface LibrarySortOption {
  field: LibrarySortField;
  icon: LucideIcon;
  label: string;
}
