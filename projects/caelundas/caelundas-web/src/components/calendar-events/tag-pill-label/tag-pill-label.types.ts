// 🏷️ Types

/**
 * What leads a tag's pill: an icon or a symbol.
 */
export interface TagLead {
  kind: "glyph" | "icon";
  value: string;
}
