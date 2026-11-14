// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Words a meander's size: its rows and columns, as `2 × 3`.
 */
export function formatShape(rows: number, columns: number): string {
  return `${rows} × ${columns}`;
}

/**
 * Wraps an SVG document as a data URI an `img` can show, never as page
 * markup.
 */
export function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
