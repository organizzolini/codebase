// 🏷️ Types
import _ from "lodash";

import {
  aspects,
  bodies,
  lunarPhases,
  majorAspects,
  minorAspects,
  signs,
  specialtyAspects,
} from "./caelundas.constants";
import { symbolByDecan } from "./symbol-caelundas.constants";

import type {
  aspectPhases,
  eclipsePhases,
  retrogradeBodies,
} from "./caelundas.constants";
import type {
  symbolByAsteroid,
  symbolByBody,
  symbolByLunarPhase,
  symbolByMajorAspect,
  symbolByMartianPhase,
  symbolByMercurianPhase,
  symbolByMinorAspect,
  symbolByNode,
  symbolByOrbitalDirection,
  symbolByPlanet,
  symbolByQuadrupleAspect,
  symbolByQuintupleAspect,
  symbolBySextupleAspect,
  symbolBySign,
  symbolBySpecialtyAspect,
  symbolByTripleAspect,
  symbolByVenusianPhase,
} from "./symbol-caelundas.constants";
/**
 * Union of all two-body aspect types (major, minor, and specialty).
 */
export type Aspect = (typeof aspects)[number];

/**
 * Whether two bodies approach, sit at, or depart from an exact aspect angle.
 */
export type AspectPhase = (typeof aspectPhases)[number];

// 🔟 Decans

/**
 * Asteroids (minor planets) tracked for astrological significance.
 *
 * Includes major asteroids: Ceres, Pallas, Juno, Vesta, Chiron.
 */
export type Asteroid = keyof typeof symbolByAsteroid;

/**
 * Every celestial body caelundas tracks: planets, asteroids, comets and calculated lunar points.
 */
export type Body = keyof typeof symbolByBody;

// 🪐 Planets

// export type PlanetSymbol = (typeof symbolByPlanet)[Planet];

// 💫 Asteroids

/**
 * Decan representing a 10-degree subdivision within a zodiac sign.
 *
 * Each sign is divided into three decans (e.g., "aries 1", "aries 2", "aries 3").
 */
export type Decan = keyof typeof symbolByDecan;

/**
 * Obscuration of the Moon or Sun in an eclipse: partial, total, annular, or penumbral.
 */
export type EclipsePhase = (typeof eclipsePhases)[number];

/**
 * Lunar phase representing the Moon's illumination state as seen from Earth.
 *
 * Eight phases from new moon (0°) through full moon (180°) and back.
 */
export type LunarPhase = keyof typeof symbolByLunarPhase;

/**
 * Major aspects representing primary angular relationships between bodies.
 *
 * Includes conjunction (0°), sextile (60°), square (90°), trine (120°),
 * opposition (180°) with orbs of ±6-8°.
 */
export type MajorAspect = keyof typeof symbolByMajorAspect;

/**
 * Mars's illumination and visibility from Earth; it never appears as a crescent.
 */
export type MartianPhase = keyof typeof symbolByMartianPhase;

/**
 * Mercury's illumination and visibility from Earth, cycling faster than Venus's phases.
 */
export type MercurianPhase = keyof typeof symbolByMercurianPhase;

/**
 * Minor aspects representing secondary angular relationships between bodies.
 *
 * Includes semi-sextile (30°), semi-square (45°), sesquiquadrate (135°),
 * quincunx (150°) with ±3° orbs.
 */
export type MinorAspect = keyof typeof symbolByMinorAspect;

/**
 * Lunar nodes and apsides representing calculated points in the Moon's orbit.
 *
 * Includes north/south nodes (ecliptic intersections) and lunar perigee/apogee
 * (closest/farthest points from Earth).
 */
export type Node = keyof typeof symbolByNode;

/**
 * Direction of a planet's apparent motion relative to the zodiac.
 *
 * Values: "direct" (eastward), "retrograde" (westward), "stationary" (transition).
 */
export type OrbitalDirection = keyof typeof symbolByOrbitalDirection;

/**
 * Classical and modern planets tracked for ephemeris calculations, including the luminaries.
 */
export type Planet = keyof typeof symbolByPlanet;

/**
 * Four-body patterns: grand cross (two oppositions, four squares), kite (a grand trine plus an opposing body), and mystic rectangle.
 */
export type QuadrupleAspect = keyof typeof symbolByQuadrupleAspect;

/**
 * Five-body aspect patterns, which form rarely and typically only with asteroids or lunar nodes.
 */
export type QuintupleAspect = keyof typeof symbolByQuintupleAspect;

/**
 * Bodies that can appear retrograde from Earth: planets other than the Sun and Moon.
 */
export type RetrogradeBody = (typeof retrogradeBodies)[number];

// export type LunarPhaseSymbol = (typeof symbolByLunarPhase)[LunarPhase];

// ♀️ Venusian Phases

/**
 * Six-body patterns: grand sextile (six bodies 60° apart) and star of David.
 */
export type SextupleAspect = keyof typeof symbolBySextupleAspect;

/**
 * Zodiac sign: a 30-degree segment of the tropical ecliptic, starting at the vernal equinox.
 */
export type Sign = keyof typeof symbolBySign;

// ☿️ Mercurian Phases

// ♂️ Martian Phases

/**
 * Specialty aspects based on harmonic divisions of the zodiac circle.
 *
 * Includes quintile (72°), biquintile (144°), septile (51.43°), novile (40°)
 * with ±1-2° orbs.
 */
export type SpecialtyAspect = keyof typeof symbolBySpecialtyAspect;

// 📐 Aspect Phases

/**
 * Unicode symbol representing a specialty aspect.
 */
export type SpecialtyAspectSymbol =
  (typeof symbolBySpecialtyAspect)[SpecialtyAspect];

/**
 * Three-body patterns: grand trine, t-square, and yod.
 */
export type TripleAspect = keyof typeof symbolByTripleAspect;

// 🔭 Body Types

/**
 * Venus's illumination and visibility from Earth, following its eight-year cycle as morning or evening star.
 */
export type VenusianPhase = keyof typeof symbolByVenusianPhase;

/**
 * Names a body as every summary, description, and tag does, via lodash start
 * case; invert with {@link bodyFromDisplayName}.
 */
export function bodyDisplayName(body: string): string {
  return _.startCase(body);
}

/**
 * Inverts {@link bodyDisplayName}: returns the body a display name belongs to,
 * or `undefined` when the name is not a body's canonical display name.
 */
export function bodyFromDisplayName(displayName: string): Body | undefined {
  return bodyByDisplayName.get(displayName);
}

/**
 * Uppercases the first character, mirroring `Capitalize<T>` at the value
 * level; prefer it to `as Capitalize<T>` casts.
 */
export function capitalize<T extends string>(str: T): Capitalize<T> {
  // type-coverage:ignore-next-line
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

/**
 * Groups items by a key function into a typed `Map`, preserving the key type
 * rather than widening it to `string`.
 */
export function groupByToMap<K extends PropertyKey, T>(
  items: T[],
  keyFunction: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFunction(item);
    const existing = map.get(key);
    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

/**
 * Narrows an arbitrary string to the `Aspect` union at runtime.
 */
export function isAspect(aspect: string): aspect is Aspect {
  return (aspects as readonly string[]).includes(aspect);
}

/**
 * Narrows an arbitrary string to the `Body` union at runtime.
 */
export function isBody(body: string): body is Body {
  return (bodies as readonly string[]).includes(body);
}

/**
 * Narrows an arbitrary string to the `Decan` union at runtime.
 */
export function isDecan(decan: string): decan is Decan {
  return Object.hasOwn(symbolByDecan, decan);
}

/**
 * Type guard for a key of `object`; use instead of `value as keyof T` casts
 * when indexing `const` objects.
 */
export function isKeyOf<T extends object>(
  object: T,
  key: PropertyKey,
): key is keyof T {
  return key in object;
}

/**
 * Narrows an arbitrary string to the `LunarPhase` union at runtime.
 */
export function isLunarPhase(lunarPhase: string): lunarPhase is LunarPhase {
  return (lunarPhases as readonly string[]).includes(lunarPhase);
}

/**
 * Narrows an arbitrary string to the `MajorAspect` union at runtime.
 */
export function isMajorAspect(majorAspect: string): majorAspect is MajorAspect {
  return (majorAspects as readonly string[]).includes(majorAspect);
}

/**
 * Narrows an arbitrary string to the `MinorAspect` union at runtime.
 */
export function isMinorAspect(minorAspect: string): minorAspect is MinorAspect {
  return (minorAspects as readonly string[]).includes(minorAspect);
}

/**
 * Narrows an arbitrary string to the `Sign` union at runtime.
 */
export function isSign(sign: string): sign is Sign {
  return (signs as readonly string[]).includes(sign);
}

/**
 * Narrows an arbitrary string to the `SpecialtyAspect` union at runtime.
 */
export function isSpecialtyAspect(
  specialtyAspect: string,
): specialtyAspect is SpecialtyAspect {
  return (specialtyAspects as readonly string[]).includes(specialtyAspect);
}

/**
 * A typed `Object.entries` that keeps the record's key union rather than
 * widening keys to `string`.
 */
export function objectEntries<K extends string, V>(
  record: Record<K, V>,
): [K, V][] {
  // type-coverage:ignore-next-line
  return Object.entries(record) as [K, V][];
}

/**
 * A typed `Object.fromEntries` that keeps the key union; the cast lives here so
 * callers need none.
 */
export function typedFromEntries<K extends string, V>(
  entries: [K, V][],
): Record<K, V> {
  // type-coverage:ignore-next-line
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Lowercases the first character of a string literal type.
 */
export function uncapitalize<T extends string>(str: T): Uncapitalize<T> {
  // type-coverage:ignore-next-line
  return (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<T>;
}

const bodyByDisplayName: ReadonlyMap<string, Body> = new Map(
  bodies.map((body) => [bodyDisplayName(body), body]),
);
