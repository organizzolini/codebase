import { typedObjectKeys } from "./caelundas.utilities";
import {
  symbolByBody,
  symbolByLunarPhase,
  symbolByMajorAspect,
  symbolByMinorAspect,
  symbolByNode,
  symbolBySign,
  symbolBySpecialtyAspect,
} from "./symbol-caelundas.constants";

// ♟️ Constants

// Local type aliases for ephemeris body subsets to avoid a circular import through ephemeris.types.ts
// These are copies of the corresponding types in ephemeris.types.ts — update both if the body sets change.
/** Bodies for which azimuth/elevation ephemerides are generated. */
type AzimuthElevationEphemerisBody = Extract<Body, "moon" | "sun">;
/** Union of all tracked celestial bodies, derived from the symbol map. */
type Body = keyof typeof symbolByBody;
/** Bodies for which distance ephemerides are generated. */
type DistanceEphemerisBody = Extract<
  Body,
  "mars" | "mercury" | "moon" | "sun" | "venus"
>;
/** Bodies for which illumination ephemerides are generated. */
type IlluminationEphemerisBody = Extract<
  Body,
  "mars" | "mercury" | "moon" | "sun" | "venus"
>;

/** Union of all supported aspect keys from the combined aspect symbol map. */
const aspectSymbols = {
  ...symbolByMajorAspect,
  ...symbolByMinorAspect,
  ...symbolBySpecialtyAspect,
} as const;

/** Union of all supported aspect keys from the merged aspect symbol maps. */
type Aspect = keyof typeof aspectSymbols;
// Local type aliases derived from constants to avoid circular imports with caelundas.types.ts
/** Union of major-aspect keys from the major-aspect symbol map. */
type MajorAspect = keyof typeof symbolByMajorAspect;
/** Union of minor aspect keys derived from the minor-aspect symbol map. */
type MinorAspect = keyof typeof symbolByMinorAspect;
/** Union of specialty aspect keys derived from the specialty-aspect symbol map. */
type SpecialtyAspect = keyof typeof symbolBySpecialtyAspect;

// export const symbolByPhase = {
//   ...symbolByLunarPhase,
//   ...symbolByVenusianPhase,
//   ...symbolByMercurianPhase,
//   ...symbolByMartianPhase,
// } as const;

// 🏠 Houses

// 🔄 Event Phase Types

/**
 * Aspect lifecycle: forming, perfective at peak, then dissolving.
 */
export const aspectPhases = ["forming", "perfective", "dissolving"] as const;
/** Eclipse event phases: start, peak, and end. */
export const eclipsePhases = ["beginning", "maximum", "ending"] as const;

// 🔭 Body Arrays

/** Bodies that can retrograde; excludes Sun, Moon, and nodes. */
export const retrogradeBodies = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
  "lilith",
  "ceres",
  "pallas",
  "juno",
  "vesta",
] as const;

/** Bodies tracked for sign and decan ingress events. */
export const ingressBodies = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
  "lilith",
  "ceres",
  "pallas",
  "juno",
  "vesta",
  "north lunar node",
  "lunar apogee",
] as const;

/** Bodies used in aspect calculations; matches ingressBodies. */
export const aspectBodies = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
  "lilith",
  "ceres",
  "pallas",
  "juno",
  "vesta",
  "north lunar node",
  "lunar apogee",
] as const;

// 🪧 Signs

/** Zodiac sign names in tropical order, starting with Aries (0°). */
export const signs = typedObjectKeys(symbolBySign);
// export const signSymbols: SignSymbol[] = Object.values(symbolBySign);

// 🔟 Decans

// export const decans = Object.keys(symbolByDecan) as Decan[];
// export const decanSymbols: DecanSymbol[] = Object.values(symbolByDecan);

// 🪐 Planets

// export const planets = Object.keys(symbolByPlanet) as Planet[];
// export const planetSymbols: PlanetSymbol[] = Object.values(symbolByPlanet);

// 💫 Asteroids

// export const asteroids = Object.keys(symbolByAsteroid) as Asteroid[];
// export const asteroidSymbols: AsteroidSymbol[] =
//   Object.values(symbolByAsteroid);

// ☄️ Comets

// export const comets = Object.keys(symbolByComet) as Comet[];
// export const cometSymbols: CometSymbol[] = Object.values(symbolByComet);

// 🌕 Nodes

/**
 * Array of lunar node names.
 * Includes ascending/descending nodes and apogee/perigee points.
 */
export const nodes = typedObjectKeys(symbolByNode);
// export const nodeSymbols: NodeSymbol[] = Object.values(symbolByNode);

// 🔭 Bodies

/** All tracked celestial bodies: planets, asteroids, comets, and nodes. */
export const bodies = typedObjectKeys(symbolByBody);
// export const bodySymbols: BodySymbol[] = Object.values(symbolByBody);

/** Bodies queried for azimuth/elevation, for rise, set, and culmination. */
export const azimuthElevationBodies: AzimuthElevationEphemerisBody[] = [
  "sun",
  "moon",
];

/** Bodies queried for illumination; Moon phases use elongation instead. */
export const illuminationBodies: IlluminationEphemerisBody[] = [
  "mercury",
  "venus",
  "mars",
];

/**
 * Bodies queried for distance ephemeris.
 * Used for apsis, phase and eclipse detection.
 */
export const distanceBodies: DistanceEphemerisBody[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
];

// 🧭 Aspects

// 📐 Major Aspects

/** Major aspect names: the five Ptolemaic aspects. */
export const majorAspects = typedObjectKeys(symbolByMajorAspect);
// export const majorAspectSymbols: MajorAspectSymbol[] =
//   Object.values(symbolByMajorAspect);

// 🖇️ Minor Aspects

/**
 * Array of minor aspect names.
 * Includes semi-sextile, semi-square, sesquiquadrate, quincunx.
 */
export const minorAspects = typedObjectKeys(symbolByMinorAspect);
// export const minorAspectSymbols: MinorAspectSymbol[] =
//   Object.values(symbolByMinorAspect);

// 🧮 Specialty Aspects

/** Specialty aspect names, harmonic divisions by 5, 7, 9. */
export const specialtyAspects = typedObjectKeys(symbolBySpecialtyAspect);
// export const specialtyAspectSymbols: SpecialtyAspectSymbol[] = Object.values(
//   symbolBySpecialtyAspect,
// );

// 📐 Double Aspects

/**
 * Array of all aspect names.
 * Combines major, minor, and specialty aspects.
 */
export const aspects = typedObjectKeys(aspectSymbols);
// export const aspectSymbols: AspectSymbol[] = Object.values(symbolByAspect);

// 🔮 Aspect Orbs

/**
 * Maps each major aspect to its exact angle in degrees.
 */
const angleByMajorAspect: Record<MajorAspect, number> = {
  conjunct: 0,
  opposite: 180,
  sextile: 60,
  square: 90,
  trine: 120,
};

/**
 * Maps each minor aspect to its exact angle in degrees.
 */
const angleByMinorAspect: Record<MinorAspect, number> = {
  quincunx: 150,
  semisextile: 30,
  semisquare: 45,
  sesquiquadrate: 135,
};

/** Exact angle in degrees of each specialty aspect. */
const angleBySpecialtyAspect: Record<SpecialtyAspect, number> = {
  biquintile: 144,
  decile: 36,
  novile: 40,
  quintile: 72,
  septile: 51.428_571_428_571_43,
  tredecile: 108,
  undecile: 32.727_272_727_272_73,
};

/**
 * Complete mapping of all aspects to their exact angles in degrees.
 */
export const angleByAspect: Record<Aspect, number> = {
  ...angleByMajorAspect,
  ...angleByMinorAspect,
  ...angleBySpecialtyAspect,
};

/** Allowed orb in degrees for each major aspect. */
const orbByMajorAspect: Record<MajorAspect, number> = {
  conjunct: 8,
  opposite: 8,
  sextile: 4,
  square: 6,
  trine: 6,
};

/** Allowed orb in degrees for each minor aspect. */
const orbByMinorAspect: Record<MinorAspect, number> = {
  quincunx: 3,
  semisextile: 2,
  semisquare: 2,
  sesquiquadrate: 2,
};

/** Allowed orb in degrees for each specialty aspect. */
const orbBySpecialtyAspect: Record<SpecialtyAspect, number> = {
  biquintile: 2,
  decile: 1,
  novile: 1,
  quintile: 2,
  septile: 1,
  tredecile: 1,
  undecile: 1,
};

/** Orb tolerance in degrees for every aspect, used in detection. */
export const orbByAspect: Record<Aspect, number> = {
  ...orbByMajorAspect,
  ...orbByMinorAspect,
  ...orbBySpecialtyAspect,
};

// 🔺 Triple Aspects

// export const tripleAspects = Object.keys(
//   symbolByTripleAspect,
// ) as TripleAspect[];
// export const tripleAspectSymbols: TripleAspectSymbol[] =
//   Object.values(symbolByTripleAspect);

// ✖️ Quadruple Aspects

// export const quadrupleAspects = Object.keys(
//   symbolByQuadrupleAspect,
// ) as QuadrupleAspect[];
// export const quadrupleAspectSymbols: QuadrupleAspectSymbol[] = Object.values(
//   symbolByQuadrupleAspect,
// );

// ⭐ Quintuple Aspects

// export const quintupleAspects = Object.keys(
//   symbolByQuintupleAspect,
// ) as QuintupleAspect[];
// export const quintupleAspectSymbols: QuintupleAspectSymbol[] = Object.values(
//   symbolByQuintupleAspect,
// );

// 🔯 Sextuple Aspects

// export const sextupleAspects = Object.keys(
//   symbolBySextupleAspect,
// ) as SextupleAspect[];
// export const sextupleAspectSymbols: SextupleAspectSymbol[] = Object.values(
//   symbolBySextupleAspect,
// );

// ✨ Stellium

// export const stelliums = Object.keys(symbolByStellium) as Stellium[];
// export const stelliumSymbols: StelliumSymbol[] =
//   Object.values(symbolByStellium);

// 🔁 Orbital Directions

// export const orbitalDirections = Object.keys(
//   symbolByOrbitalDirection,
// ) as OrbitalDirection[];
// export const orbitalDirectionSymbols: OrbitalDirectionSymbol[] = Object.values(
//   symbolByOrbitalDirection,
// );

// ⏫ Planetary Directions

// export const planetaryDirections = Object.keys(
//   symbolByPlanetaryDirection,
// ) as PlanetaryDirection[];
// export const planetaryDirectionSymbols: PlanetaryDirectionSymbol[] =
//   Object.values(symbolByPlanetaryDirection);

// 🧭 Directions

// export const directions = Object.keys(symbolByDirection) as Direction[];
// export const directionSymbols: DirectionSymbol[] =
//   Object.values(symbolByDirection);

// 🌐 Positions

// export const apsides = Object.keys(symbolByApsis) as Apsis[];
// export const apsisSymbols: ApsisSymbol[] = Object.values(symbolByApsis);

// export const positions = Object.keys(symbolByPosition) as Position[];
// export const positionSymbols: PositionSymbol[] =
//   Object.values(symbolByPosition);

// 🌓 Phases

/**
 * Array of lunar phase names in order through the lunar month.
 */
export const lunarPhases = typedObjectKeys(symbolByLunarPhase);
// export const lunarPhaseSymbols: LunarPhaseSymbol[] =
//   Object.values(symbolByLunarPhase);

// ♀️ Venusian Phases

// export const venusianPhases = Object.keys(
//   symbolByVenusianPhase,
// ) as VenusianPhase[];
// export const venusianPhaseSymbols: VenusianPhaseSymbol[] = Object.values(
//   symbolByVenusianPhase,
// );

// ☿️ Mercurian Phases

// export const mercurianPhases = Object.keys(
//   symbolByMercurianPhase,
// ) as MercurianPhase[];
// export const mercurianPhaseSymbols: MercurianPhaseSymbol[] = Object.values(
//   symbolByMercurianPhase,
// );

// ♂️ Martian Phases

// export const martianPhases = Object.keys(
//   symbolByMartianPhase,
// ) as MartianPhase[];
// export const martianPhaseSymbols: MartianPhaseSymbol[] =
//   Object.values(symbolByMartianPhase);

// export const phases = Object.keys(symbolByPhase) as Phase[];
// export const phaseSymbols: PhaseSymbol[] = Object.values(symbolByPhase);

// 🏠 Houses

// export const houses = Object.keys(symbolByHouse) as House[];
// export const houseSymbols: HouseSymbol[] = Object.values(symbolByHouse);

// ⏱️ Ephemeris

/**
 * Margin in minutes added before/after date ranges for ephemeris queries (30).
 */
export const MARGIN_MINUTES = 30;
