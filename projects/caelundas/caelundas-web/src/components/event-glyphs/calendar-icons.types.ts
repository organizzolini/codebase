// 🏷️ Types

/**
 * One piece of an event's symbols: an icon that stands for a symbol, or the
 * text of whatever has no icon, such as a hyphen or an emoji.
 */
export type GlyphPart =
  | { file: string; id: string; kind: "icon"; symbol: string; url: string }
  | { id: string; kind: "text"; text: string };
