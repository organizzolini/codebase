import { FALLBACK_DRAWING_SIZE } from "./meander-card.constants";

import type { DrawingSize } from "./meander-card.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The Code shown and copied, with its repeats spelled `r<n>` as the Code
 * format does.
 */
export function formatCode(code: string, repeats: number): string {
  return `${code}r${repeats}`;
}

/**
 * Reads the width and height the API drew an SVG at, else a fallback.
 */
export function readDrawingSize(svg: string): DrawingSize {
  const match = /<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/u.exec(
    svg,
  );

  return match?.[1] !== undefined && match[2] !== undefined
    ? { height: Number(match[2]), width: Number(match[1]) }
    : FALLBACK_DRAWING_SIZE;
}

/**
 * Wraps an SVG document as a data URI an `img` can show, never as page
 * markup.
 */
export function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
