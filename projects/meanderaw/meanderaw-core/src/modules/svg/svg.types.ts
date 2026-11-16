// 🏷️ Types

/** Every field here is already formatted for direct interpolation into SVG markup. */
export interface RenderOptions {
  /** Path data of filled squares, one for each dot. */
  readonly dots: readonly string[];
  readonly height: string;
  readonly paths: readonly string[];
  readonly strokeWidth: string;
  readonly width: string;
}
