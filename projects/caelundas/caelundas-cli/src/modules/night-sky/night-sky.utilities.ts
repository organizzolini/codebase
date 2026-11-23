// The stars come from the HYG database v4.1 (https://github.com/astronexus/HYG-Database),
// CC BY-SA 4.0, David Nash and the HYG contributors; the stored catalog is a
// derived work under the same license. The figures come from d3-celestial
// (https://github.com/ofrohn/d3-celestial), BSD-3-Clause, Olaf Frohn, after
// the IAU's constellation charts.

import {
  CATALOG_COLUMNS,
  constellationsFileSchema,
  INDEX_BANDS_PER_DEGREE,
  linesFileSchema,
  MATCH_TOLERANCE_DEGREES,
  MAXIMUM_MAGNITUDE,
  MINIMUM_DECLINATION_DEGREES,
  MISSING_COLOR_INDEX,
  NightSkySourceError,
  SPLIT_CONSTELLATION_NAMES,
  ZODIAC_DESIGNATIONS,
} from "./night-sky.constants";

import type {
  CatalogStar,
  ConstellationEdgeRow,
  ConstellationFigureRow,
  ConstellationRow,
  NightSkyRows,
  NightSkySources,
  StarIndex,
} from "./night-sky.types";

// 🔏 Private Functions

/**
 * Builds the night sky's rows from the three files: stars as bright as the eye
 * sees, plus any fainter one a figure joins.
 */
export function buildNightSkyRows(sources: NightSkySources): NightSkyRows {
  const catalog = parseStarCatalog(sources.stars);
  const edges = traceConstellationEdges(sources.lines, indexStars(catalog));
  const joined = new Set<number>();
  const constellations: ConstellationFigureRow[] = [];

  for (const constellation of parseConstellations(sources.constellations)) {
    const figure = edges.get(constellation.designation) ?? [];

    for (const { fromHip, toHip } of figure) {
      joined.add(fromHip).add(toHip);
    }
    constellations.push({ ...constellation, edges: figure });
  }

  return {
    constellations,
    stars: catalog.filter(
      (star) => star.magnitude <= MAXIMUM_MAGNITUDE || joined.has(star.hip),
    ),
  };
}

/**
 * The catalog star a vertex of a figure lies on, within the tolerance, or
 * nothing. A vertex is [right ascension, declination] in degrees.
 */
export function findStar(
  index: StarIndex,
  vertex: readonly [number, number],
): CatalogStar | undefined {
  const band = toBand(vertex[1]);
  const neighbors = [band - 1, band, band + 1].flatMap(
    (key) => index.get(key) ?? [],
  );
  const nearest = neighbors
    .map((star) => ({ separation: measureSeparation(star, vertex), star }))
    .toSorted((first, second) => first.separation - second.separation)
    .at(0);

  return nearest !== undefined && nearest.separation <= MATCH_TOLERANCE_DEGREES
    ? nearest.star
    : undefined;
}

/**
 * Groups stars by declination band, for `findStar`.
 */
export function indexStars(stars: readonly CatalogStar[]): StarIndex {
  const index = new Map<number, CatalogStar[]>();

  for (const star of stars) {
    const band = toBand(star.declinationDegrees);

    const members = index.get(band) ?? [];

    members.push(star);
    index.set(band, members);
  }

  return index;
}

/**
 * Reads d3-celestial's constellations, marking the twelve of the zodiac. A
 * constellation drawn in two parts is one row, under its whole name.
 */
export function parseConstellations(text: string): ConstellationRow[] {
  const rows = new Map<string, ConstellationRow>();

  for (const feature of constellationsFileSchema.parse(JSON.parse(text))
    .features) {
    rows.set(feature.id, {
      designation: feature.id,
      name:
        SPLIT_CONSTELLATION_NAMES.get(feature.id) ?? feature.properties.name,
      zodiac: ZODIAC_DESIGNATIONS.has(feature.id),
    });
  }

  return [...rows.values()];
}

/**
 * Reads the HYG CSV's Hipparcos-numbered stars at -45° or north, of any
 * magnitude; throws when a column is missing.
 */
export function parseStarCatalog(text: string): CatalogStar[] {
  const [header = "", ...lines] = text.split(/\r?\n/u);
  const names = splitCsvLine(header);
  const positions = CATALOG_COLUMNS.map((column) => names.indexOf(column));

  if (positions.includes(-1)) {
    throw new NightSkySourceError(
      `The star catalog lacks one of the columns ${CATALOG_COLUMNS.join(", ")}`,
    );
  }

  return lines.flatMap((line) => {
    const fields = splitCsvLine(line);
    const star = readCatalogStar(
      positions.map((position) => fields[position] ?? ""),
    );

    return star === undefined ? [] : [star];
  });
}

/**
 * Reads figures as segments between catalog stars by Hipparcos number,
 * grouped by constellation, dropping ends with no matching star and
 * duplicate segments.
 */
export function traceConstellationEdges(
  text: string,
  index: StarIndex,
): ReadonlyMap<string, ConstellationEdgeRow[]> {
  const segments = new Map<
    string,
    { designation: string; edge: ConstellationEdgeRow }
  >();

  for (const feature of linesFileSchema.parse(JSON.parse(text)).features) {
    for (const polyline of feature.geometry.coordinates) {
      const stars = polyline.map((vertex) => findStar(index, vertex));

      for (const [position, from] of stars.slice(0, -1).entries()) {
        const to = stars[position + 1];

        if (from !== undefined && to !== undefined && from !== to) {
          const key = [
            feature.id,
            ...[from.hip, to.hip].toSorted((first, second) => first - second),
          ].join(":");

          segments.set(
            key,
            segments.get(key) ?? {
              designation: feature.id,
              edge: { fromHip: from.hip, toHip: to.hip },
            },
          );
        }
      }
    }
  }

  return groupEdges([...segments.values()]);
}

// 🌎 Public Functions

/** Groups edges by their constellation's designation, in first-seen order. */
function groupEdges(
  segments: readonly { designation: string; edge: ConstellationEdgeRow }[],
): Map<string, ConstellationEdgeRow[]> {
  const grouped = new Map<string, ConstellationEdgeRow[]>();

  for (const { designation, edge } of segments) {
    grouped.set(designation, [...(grouped.get(designation) ?? []), edge]);
  }

  return grouped;
}

/**
 * The degrees between a star and a vertex, along the sky, close enough for
 * the small separations matching compares.
 */
function measureSeparation(
  star: CatalogStar,
  [longitude, latitude]: readonly [number, number],
): number {
  const rightAscensionDegrees = ((longitude % 360) + 360) % 360;
  const across =
    ((((star.rightAscensionHours * 15 - rightAscensionDegrees) % 360) + 540) %
      360) -
    180;

  return Math.hypot(
    across * Math.cos((latitude * Math.PI) / 180),
    star.declinationDegrees - latitude,
  );
}

/**
 * Reads one catalog row; undefined for the Sun, an unnumbered or southern star,
 * or an unreadable row.
 */
function readCatalogStar(fields: readonly string[]): CatalogStar | undefined {
  const [id, hip, ra, dec, mag, ci] = fields;
  const star = {
    colorIndex: ci === "" ? MISSING_COLOR_INDEX : Number(ci),
    declinationDegrees: Number(dec),
    hip: hip === "" ? Number.NaN : Number(hip),
    magnitude: Number(mag),
    rightAscensionHours: Number(ra),
  };

  if (id === "0" || Object.values(star).some((value) => Number.isNaN(value))) {
    return undefined;
  }

  return star.declinationDegrees < MINIMUM_DECLINATION_DEGREES
    ? undefined
    : roundStar(star);
}

/**
 * Rounds a star to the precision the night sky draws with.
 */
function roundStar(star: CatalogStar): CatalogStar {
  return {
    colorIndex: Number(star.colorIndex.toFixed(2)),
    declinationDegrees: Number(star.declinationDegrees.toFixed(3)),
    hip: star.hip,
    magnitude: Number(star.magnitude.toFixed(1)),
    rightAscensionHours: Number(star.rightAscensionHours.toFixed(4)),
  };
}

/**
 * Splits one CSV line into fields, honoring double-quoted fields.
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let quoted = false;

  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }

  return [...fields, field];
}

/**
 * The band of declination a position falls in, as the index groups stars.
 */
function toBand(declinationDegrees: number): number {
  return Math.round(declinationDegrees * INDEX_BANDS_PER_DEGREE);
}
