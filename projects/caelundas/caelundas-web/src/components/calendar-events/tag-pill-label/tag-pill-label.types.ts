// 🏷️ Types

/**
 * What leads a tag's pill: its lucide icon, else the symbol of its name, else the generic tag icon.
 */
export interface TagLead {
  kind: "glyph" | "icon";
  value: string;
}
