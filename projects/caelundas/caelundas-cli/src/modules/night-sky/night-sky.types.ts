// 🏷️ Types

/** HYG catalog star with a Hipparcos number, at J2000. */
export interface CatalogStar {
  colorIndex: number;
  declinationDegrees: number;
  hipparcosNumber: number;
  magnitude: number;
  rightAscensionHours: number;
}

/** Figure segment between two stars, saved with its constellation's `edges`. */
export interface ConstellationEdgeRow {
  sourceNode: number;
  targetNode: number;
}

/** A constellation with its figure's segments. */
export interface ConstellationFigureRow extends ConstellationRow {
  /** The segments of its figure; the constellation supplies their key. */
  edges: ConstellationEdgeRow[];
}

/**
 * One of the IAU constellations, as the `constellation` table stores it.
 */
export interface ConstellationRow {
  /** The IAU designation, such as `UMa`. */
  designation: string;
  /** The Latin name, such as `Ursa Major`. */
  isZodiac: boolean;
  name: string;
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
  constellations: ConstellationFigureRow[];
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
 * Stars bucketed by declination to 0.1°, so matches check neighbors.
 */
export type StarIndex = ReadonlyMap<number, readonly CatalogStar[]>;
