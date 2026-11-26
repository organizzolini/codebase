// ♟️ Constants
import _ from "lodash";

import { MINIMUM_STELLIUM_BODIES } from "../aspects/modules/stellium/stellium.constants";
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
import { SOLAR_INTERVAL_NAMES } from "../perfective/modules/annual-solar-cycle/annual-solar-cycle.constants";
import { eclipseTypeLabelByType } from "../perfective/modules/eclipses/eclipses.constants";
import {
  DECAN_TAG_BY_DECAN,
  HALF_TAG_BY_HALF,
} from "../perfective/modules/ingresses/ingresses.constants";

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

/** Every body's display name, as detectors tag it. */
const BODY_NAMES = bodies.map((body) => bodyDisplayName(body));

/** The largest stellium the detector names: one past the smallest per size. */
const MAXIMUM_STELLIUM_BODIES =
  MINIMUM_STELLIUM_BODIES + Object.keys(symbolByStellium).length - 1;

const SIMPLE_ASPECT: TagPath = [TAG_ROOT.aspect, "Simple"];
const COMPOUND_ASPECT: TagPath = [TAG_ROOT.aspect, "Compound"];

/** The annual solar cycle's node, with its points beneath it. */
const ANNUAL_CYCLE: TagPath = [TAG_ROOT.solar, "Annual Cycle"];

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

/** The lunar month's node, with its phases beneath it. */
const MONTHLY_CYCLE: TagPath = [TAG_ROOT.lunar, "Monthly Cycle"];

/** The planets' apparent direction, with stations and retrograde spans beneath it. */
const DIRECTION: TagPath = [TAG_ROOT.planetary, "Direction"];

/** The twilight node, with every event and span of it beneath. */
const TWILIGHT: TagPath = [TAG_ROOT.daily, "Twilight"];

/** Names of every twilight event and span. */
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

/** The daily cycles, with each point's raw tag and node. */
const DAILY_CYCLES = [
  [
    "Daily Lunar Cycle",
    [
      ["Moonrise", "Rise"],
      ["Moonset", "Set"],
      ["Lunar Zenith", "Zenith"],
      ["Lunar Nadir", "Nadir"],
      ["Moon Up", "Moon Up"],
    ],
  ],
  [
    "Daily Solar Cycle",
    [
      ["Sunrise", "Rise"],
      ["Sunset", "Set"],
      ["Solar Zenith", "Zenith"],
      ["Solar Nadir", "Nadir"],
    ],
  ],
] as const;

/** Raw tags with one meaning everywhere, such as bodies. */
export const SHARED_TAG_MAP: TagMap = {
  ...mapNone(UNCLASSIFIED_RAW_TAGS),
  ...Object.fromEntries(
    bodies.map((body): [string, readonly TagPath[]] => [
      bodyDisplayName(body),
      [[TAG_ROOT.body, ...BODY_CLASS_BY_BODY[body], bodyDisplayName(body)]],
    ]),
  ),
  ...Object.fromEntries(
    signs.map((sign): [string, readonly TagPath[]] => [
      _.startCase(sign),
      signPaths(sign),
    ]),
  ),
  ...mapEach(Object.values(DECAN_TAG_BY_DECAN), (name) => [
    TAG_ROOT.zodiac,
    "Decan",
    name,
  ]),
  ...mapEach(Object.values(HALF_TAG_BY_HALF), (name) => [
    TAG_ROOT.zodiac,
    "Peak",
    name,
  ]),
  ...mapEach(
    BODY_NAMES.map((name) => `${name} Focal`),
    (name) => [TAG_ROOT.aspect, "Focal Body", name],
  ),
  // Which sphere an event is in is its root's job now, not a tag's.
  ...mapNone(["Lunar", "Solar"]),
};

/** The phase of an aspect: forming, exact, or separating. */
const ASPECT_PHASE_TAG_MAP: TagMap = mapEach(
  ["Dissolving", "Forming", "Perfective"],
  (name) => [TAG_ROOT.aspect, "Phase", name === "Perfective" ? "Exact" : name],
);

/** Simple aspects by class and name, with nature, harmonic, phase. */
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

/** Compound aspects by class and name, with phase, nature, harmonic. */
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

/** The halves of an apparition Mercury and Venus make: widening, then closing. */
const ELONGATION_PHASES = [
  "evening closing",
  "evening widening",
  "morning closing",
  "morning widening",
];

/** The halves of Mars's apparition: widening to opposition, then closing. */
const MARTIAN_SPAN_PHASES = ["evening closing", "morning widening"];

/** Mercury, Venus, and Mars synodic events, by planet and phase. */
const PLANETARY_PHASE_TAG_MAPS: Readonly<Record<string, TagMap>> = {
  Martian: mapPlanetaryPhases({
    marker: "Martian",
    phases: [...Object.keys(symbolByMartianPhase), ...MARTIAN_SPAN_PHASES],
    planetPaths: SHARED_TAG_MAP["Mars"] ?? [],
    stageByPhase: MARTIAN_SYNODIC_STAGE_BY_PHASE,
  }),
  Mercurian: mapPlanetaryPhases({
    marker: "Mercurian",
    phases: [
      ...Object.keys(symbolByMercurianPhase),
      ...VISIBILITY_PHASES,
      ...ELONGATION_PHASES,
    ],
    planetPaths: SHARED_TAG_MAP["Mercury"] ?? [],
  }),
  Venusian: mapPlanetaryPhases({
    marker: "Venusian",
    phases: [
      ...Object.keys(symbolByVenusianPhase),
      ...VISIBILITY_PHASES,
      ...ELONGATION_PHASES,
    ],
    planetPaths: SHARED_TAG_MAP["Venus"] ?? [],
  }),
};

/** Raw tags whose meaning depends on event kind. */
export const CONTEXT_TAG_MAPS: Readonly<Record<string, TagMap>> = {
  ...PLANETARY_PHASE_TAG_MAPS,
  "Compound Aspect": COMPOUND_ASPECT_TAG_MAP,
  Direction: {
    Direct: one([...DIRECTION, "Station Direct"]),
    Direction: one(DIRECTION),
    Retrograde: one([...DIRECTION, "Station Retrograde"]),
  },
  Directs: {
    Directs: one([...DIRECTION, "Direct Period"]),
  },
  Eclipse: {
    ...mapNone(["Eclipse", "Lunar", "Solar", ...ECLIPSE_TYPE_NAMES]),
    ...mapEach(["Geocentric", "Topocentric Visibility"], (name) => [
      TAG_ROOT.eclipse,
      "Frame",
      name.replace(/ Visibility$/u, ""),
    ]),
    ...mapEach(["Beginning", "Ending", "Maximum"], (name) => [
      TAG_ROOT.eclipse,
      "Phase",
      name,
    ]),
  },
  Ingress: mapNone(["Decan", "Ingress", "Peak"]),
  "Planetary Phase": mapEach(["Planetary Phase"], () => [
    TAG_ROOT.planetary,
    "Phase",
  ]),
  Retrogrades: {
    Retrogrades: one([...DIRECTION, "Retrograde Period"]),
  },
  "Simple Aspect": SIMPLE_ASPECT_TAG_MAP,
  Twilight: {
    Twilight: one(TWILIGHT),
    ...mapEach(TWILIGHT_NAMES, (name) => [...TWILIGHT, name]),
    ...mapEach(["Evening", "Morning"], (name) => [
      TAG_ROOT.daily,
      "Time of Day",
      name,
    ]),
  },
  ...Object.fromEntries(
    DAILY_CYCLES.map(([name, points]): [string, TagMap] => {
      const cycle: TagPath = [TAG_ROOT.daily, name.replace(/^Daily /u, "")];
      return [
        name,
        {
          [name]: one(cycle),
          ...Object.fromEntries(
            points.map(([rawTag, point]): [string, readonly TagPath[]] => [
              rawTag,
              one([...cycle, point]),
            ]),
          ),
        },
      ];
    }),
  ),
  "Annual Solar Cycle": {
    "Annual Solar Cycle": one(ANNUAL_CYCLE),
    ...mapEach(
      ["Advancing", "Aphelion", "Perihelion", "Retreating"],
      (name) => [...ANNUAL_CYCLE, name],
    ),
    ...mapEach(["Autumn", "Spring", "Summer", "Winter"], (name) => [
      TAG_ROOT.solar,
      "Season",
      name,
    ]),
    ...mapEach(SOLAR_INTERVAL_NAMES, (name) => [
      ...ANNUAL_CYCLE,
      "Interval",
      name,
    ]),
    ...Object.fromEntries(
      Object.entries(KIND_AND_SEASON_BY_SOLAR_CYCLE_POINT).map(
        ([name, [kind, season]]): [string, readonly TagPath[]] => [
          name,
          [
            [...ANNUAL_CYCLE, kind, name],
            [TAG_ROOT.solar, "Season", season],
          ],
        ],
      ),
    ),
  },
  "Lunar Apsides": {
    "Lunar Apsides": one([TAG_ROOT.lunar, "Apsides"]),
    ...mapEach(["Advancing", "Apogee", "Perigee", "Retreating"], (name) => [
      TAG_ROOT.lunar,
      "Apsides",
      name,
    ]),
  },
  "Monthly Lunar Cycle": {
    "Monthly Lunar Cycle": one(MONTHLY_CYCLE),
    ...mapEach(
      lunarPhases.map((phase) => _.startCase(phase)),
      (name) => [...MONTHLY_CYCLE, name],
    ),
  },
};
