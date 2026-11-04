// 🏷️ Types

/**
 * A star of the HYG catalog that carries a Hipparcos number, at J2000.
 */
export interface CatalogStar {
  colorIndex: number;
  declinationDegrees: number;
  hip: number;
  magnitude: number;
  rightAscensionHours: number;
}

/**
 * A segment of a constellation's figure, between two stars by Hipparcos
 * number, as the `constellation_line` table stores it.
 */
export interface ConstellationLineRow {
  constellationDesignation: string;
  fromHip: number;
  toHip: number;
}

/**
 * One of the IAU constellations, as the `constellation` table stores it.
 */
export interface ConstellationRow {
  /** The IAU designation, such as `UMa`. */
  designation: string;
  /** The Latin name, such as `Ursa Major`. */
  name: string;
  zodiac: boolean;
}

/**
 * The `night-sky` command's options, each the path of a downloaded file.
 */
export interface NightSkyCommandOptions {
  /** d3-celestial's `constellations.json`. */
  constellations?: string;
  /** d3-celestial's `constellations.lines.json`. */
  lines?: string;
  /** The HYG database's CSV. */
  stars?: string;
}

/**
 * The paths of the three files the night sky is ingested from.
 */
export type NightSkyFiles = Required<NightSkyCommandOptions>;

/**
 * The rows the night sky's tables are rewritten with.
 */
export interface NightSkyRows {
  constellations: ConstellationRow[];
  lines: ConstellationLineRow[];
  stars: CatalogStar[];
}

/**
 * The text of the three files the night sky is ingested from.
 */
export interface NightSkySources {
  constellations: string;
  lines: string;
  stars: string;
}

/**
 * Catalog stars grouped by their declination rounded to a tenth of a degree,
 * so a position is matched against its neighbors only.
 */
export type StarIndex = ReadonlyMap<number, readonly CatalogStar[]>;
