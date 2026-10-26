// ♟️ Constants
import _ from "lodash";

import {
  aspects,
  bodies,
  lunarPhases,
  majorAspects,
  minorAspects,
  signs,
  specialtyAspects,
} from "../caelundas/caelundas.constants";
import { bodyDisplayName } from "../caelundas/caelundas.types";
import {
  symbolByMartianPhase,
  symbolByMercurianPhase,
  symbolByQuadrupleAspect,
  symbolByQuintupleAspect,
  symbolBySextupleAspect,
  symbolByStellium,
  symbolByTripleAspect,
  symbolByVenusianPhase,
} from "../caelundas/symbol-caelundas.constants";
import { eclipseTypeLabelByType } from "../eclipses/eclipses.constants";
import { DECAN_TAG_BY_DECAN } from "../ingresses/ingresses.constants";

import {
  BODY_CLASS_BY_BODY,
  KIND_AND_SEASON_BY_SOLAR_CYCLE_POINT,
  MARTIAN_SYNODIC_STAGE_BY_PHASE,
  NATURE_AND_HARMONIC_BY_ASPECT,
  NATURE_AND_HARMONIC_BY_PATTERN,
} from "./tag-dimensions.constants";
import {
  mapClasses,
  mapEach,
  mapNone,
  mapPlanetaryPhases,
  mergeTagMaps,
  natureAndHarmonicPaths,
  one,
  signPaths,
} from "./tag-map.functions";
import { TAG_ROOT, UNCLASSIFIED_RAW_TAGS } from "./tags.constants";

import type { TagMap, TagPath } from "./tags.types";

const { type } = TAG_ROOT;

/** Every body's display name, as detectors tag it. */
const BODY_NAMES = bodies.map((body) => bodyDisplayName(body));

/** The smallest stellium: three bodies. */
const MINIMUM_STELLIUM_BODIES = 3;

/** The largest stellium the detector names: one past the smallest per size. */
const MAXIMUM_STELLIUM_BODIES =
  MINIMUM_STELLIUM_BODIES + Object.keys(symbolByStellium).length - 1;

const SIMPLE_ASPECT: TagPath = [type, "Aspect", "Simple Aspect"];
const COMPOUND_ASPECT: TagPath = [type, "Aspect", "Compound Aspect"];

/** The class of simple aspect each simple aspect name belongs to. */
const ASPECT_CLASSES = [
  ["Major Aspect", majorAspects],
  ["Minor Aspect", minorAspects],
  ["Specialty Aspect", specialtyAspects],
] as const;

/** The class of compound aspect each compound pattern name belongs to. */
const COMPOUND_CLASSES = [
  ["Triple Aspect", Object.keys(symbolByTripleAspect)],
  ["Quadruple Aspect", Object.keys(symbolByQuadrupleAspect)],
  ["Quintuple Aspect", Object.keys(symbolByQuintupleAspect)],
  ["Sextuple Aspect", Object.keys(symbolBySextupleAspect)],
  [
    "Stellium",
    Array.from(
      { length: MAXIMUM_STELLIUM_BODIES - MINIMUM_STELLIUM_BODIES + 1 },
      (_value, index) => `${String(index + MINIMUM_STELLIUM_BODIES)}-body`,
    ),
  ],
] as const;

/** The names of every twilight event and span, each a kind of twilight. */
const TWILIGHT_NAMES = [
  "Astronomical Dawn",
  "Astronomical Dusk",
  "Astronomical Twilight",
  "Civil Dawn",
  "Civil Dusk",
  "Daylight",
  "Nautical Dawn",
  "Nautical Dusk",
  "Nautical Twilight",
  "Night",
];

/** The kinds of eclipse, as the eclipse detector tags them. */
export const ECLIPSE_TYPE_NAMES = Object.values(eclipseTypeLabelByType);

/** The daily cycles, whose events no raw tag tells apart further. */
const DAILY_CYCLE_NAMES = ["Daily Lunar Cycle", "Daily Solar Cycle"];

/**
 * The raw tags that mean the same wherever they appear: bodies with their
 * class, signs with the element, modality and polarity they imply, decans,
 * the focal body of a compound aspect, the domain of the cycles and phases,
 * and the tags every event carries.
 */
export const SHARED_TAG_MAP: TagMap = {
  ...mapNone(UNCLASSIFIED_RAW_TAGS),
  ...Object.fromEntries(
    bodies.map((body): [string, readonly TagPath[]] => [
      bodyDisplayName(body),
      [
        [TAG_ROOT.planet, bodyDisplayName(body)],
        [TAG_ROOT.bodyClass, BODY_CLASS_BY_BODY[body]],
      ],
    ]),
  ),
  ...Object.fromEntries(
    signs.map((sign): [string, readonly TagPath[]] => [
      _.startCase(sign),
      signPaths(sign),
    ]),
  ),
  ...mapEach(Object.values(DECAN_TAG_BY_DECAN), (name) => [
    TAG_ROOT.decan,
    name,
  ]),
  ...mapEach(
    BODY_NAMES.map((name) => `${name} Focal`),
    (name) => [TAG_ROOT.focalBody, name],
  ),
  ...mapEach(["Lunar", "Solar"], (name) => [TAG_ROOT.domain, name]),
  ...mapEach(["Direction", "Planetary Phase", "Retrogrades"], () => [
    TAG_ROOT.domain,
    "Planetary",
  ]),
};

/** The phase of an aspect: forming, exact, or separating. */
const ASPECT_PHASE_TAG_MAP: TagMap = mapEach(
  ["Dissolving", "Forming", "Perfective"],
  (name) => [TAG_ROOT.phase, name],
);

/**
 * Simple aspects, by the class and name of the aspect, each with its nature,
 * harmonic and phase.
 */
const SIMPLE_ASPECT_TAG_MAP: TagMap = mergeTagMaps(
  ASPECT_PHASE_TAG_MAP,
  {
    "Simple Aspect": one(SIMPLE_ASPECT),
    ...mapClasses(SIMPLE_ASPECT, ASPECT_CLASSES),
  },
  Object.fromEntries(
    aspects.map((aspect): [string, readonly TagPath[]] => [
      _.startCase(aspect),
      natureAndHarmonicPaths(NATURE_AND_HARMONIC_BY_ASPECT[aspect]),
    ]),
  ),
);

/**
 * Compound aspects, by the class and name of the pattern, each with its
 * phase and the nature and harmonic of the aspects that make it up.
 */
const COMPOUND_ASPECT_TAG_MAP: TagMap = mergeTagMaps(
  ASPECT_PHASE_TAG_MAP,
  {
    "Compound Aspect": one(COMPOUND_ASPECT),
    ...mapClasses(COMPOUND_ASPECT, COMPOUND_CLASSES),
  },
  Object.fromEntries(
    Object.entries(NATURE_AND_HARMONIC_BY_PATTERN).map(
      ([pattern, natureAndHarmonic]): [string, readonly TagPath[]] => [
        pattern,
        natureAndHarmonicPaths(natureAndHarmonic),
      ],
    ),
  ),
);

/** The visibility spans every planet's paired rise and set events make. */
const VISIBILITY_PHASES = ["evening visibility", "morning visibility"];

/**
 * The Mercury, Venus and Mars synodic cycle events, by the raw tag marking
 * each planet's, its planet, and the phases it goes through.
 */
const PLANETARY_PHASE_TAG_MAPS: Readonly<Record<string, TagMap>> = {
  Martian: mapPlanetaryPhases({
    marker: "Martian",
    phases: [...Object.keys(symbolByMartianPhase), ...VISIBILITY_PHASES],
    planetPaths: SHARED_TAG_MAP["Mars"] ?? [],
    stageByPhase: MARTIAN_SYNODIC_STAGE_BY_PHASE,
  }),
  Mercurian: mapPlanetaryPhases({
    marker: "Mercurian",
    phases: [...Object.keys(symbolByMercurianPhase), ...VISIBILITY_PHASES],
    planetPaths: SHARED_TAG_MAP["Mercury"] ?? [],
  }),
  Venusian: mapPlanetaryPhases({
    marker: "Venusian",
    phases: [...Object.keys(symbolByVenusianPhase), ...VISIBILITY_PHASES],
    planetPaths: SHARED_TAG_MAP["Venus"] ?? [],
  }),
};

/**
 * Raw tags whose meaning depends on the kind of event, keyed by the raw tag
 * that marks that kind. A marked event's raw tags are looked up in its
 * marker's map as well as the shared one. Ingresses and eclipses are typed
 * from several raw tags at once, so their markers map their own raw tags to
 * nothing and the classifier derives their paths.
 */
export const CONTEXT_TAG_MAPS: Readonly<Record<string, TagMap>> = {
  ...PLANETARY_PHASE_TAG_MAPS,
  "Compound Aspect": COMPOUND_ASPECT_TAG_MAP,
  Direction: {
    Direct: one([TAG_ROOT.motion, "Station Direct"]),
    Direction: one([type, "Station"]),
    Retrograde: one([TAG_ROOT.motion, "Station Retrograde"]),
  },
  Eclipse: {
    ...mapNone(["Eclipse", "Lunar", "Solar", ...ECLIPSE_TYPE_NAMES]),
    ...mapEach(["Geocentric", "Topocentric Visibility"], (name) => [
      TAG_ROOT.eclipseFrame,
      name,
    ]),
    ...mapEach(["Beginning", "Ending", "Maximum"], (name) => [
      TAG_ROOT.phase,
      name,
    ]),
  },
  Ingress: mapNone(["Decan", "Ingress", "Peak"]),
  "Planetary Phase": mapEach(["Planetary Phase"], () => [
    type,
    "Planetary Phase",
  ]),
  Retrogrades: {
    Retrogrades: [
      [type, "Retrograde Period"],
      [TAG_ROOT.motion, "Retrograde"],
    ],
  },
  "Simple Aspect": SIMPLE_ASPECT_TAG_MAP,
  Twilight: {
    Twilight: one([type, "Twilight"]),
    ...mapEach(TWILIGHT_NAMES, (name) => [type, "Twilight", name]),
    ...mapEach(["Evening", "Morning"], (name) => [TAG_ROOT.timeOfDay, name]),
  },
  ...Object.fromEntries(
    DAILY_CYCLE_NAMES.map((name): [string, TagMap] => [
      name,
      mapEach([name], () => [type, "Cycle", name]),
    ]),
  ),
  "Annual Solar Cycle": {
    "Annual Solar Cycle": one([type, "Cycle", "Annual Solar Cycle"]),
    ...mapEach(
      ["Advancing", "Aphelion", "Perihelion", "Retreating"],
      (name) => [type, "Cycle", "Annual Solar Cycle", name],
    ),
    ...Object.fromEntries(
      Object.entries(KIND_AND_SEASON_BY_SOLAR_CYCLE_POINT).map(
        ([name, [kind, season]]): [string, readonly TagPath[]] => [
          name,
          [
            [type, "Cycle", "Annual Solar Cycle", kind, name],
            [TAG_ROOT.season, season],
          ],
        ],
      ),
    ),
  },
  "Lunar Apsides": {
    "Lunar Apsides": one([type, "Cycle", "Lunar Apsides"]),
    ...mapEach(["Apogee", "Perigee"], (name) => [
      type,
      "Cycle",
      "Lunar Apsides",
      name,
    ]),
  },
  "Monthly Lunar Cycle": {
    "Monthly Lunar Cycle": one([type, "Cycle", "Monthly Lunar Cycle"]),
    ...mapEach(
      lunarPhases.map((phase) => _.startCase(phase)),
      (name) => [TAG_ROOT.lunarPhase, name],
    ),
  },
};
