// 🏷️ Types

/**
 * One piece of an event's symbols: an icon, or text such as a hyphen or emoji that has no icon.
 */
export type GlyphPart =
  | { file: string; id: string; kind: "icon"; symbol: string; url: string }
  | { id: string; kind: "text"; text: string };
