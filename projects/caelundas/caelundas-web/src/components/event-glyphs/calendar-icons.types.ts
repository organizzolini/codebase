// 🏷️ Types

/**
 * One piece of an event's symbols: an icon or plain text.
 */
export type GlyphPart =
  | { file: string; id: string; kind: "icon"; symbol: string; url: string }
  | { id: string; kind: "text"; text: string };
