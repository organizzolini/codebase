import _ from "lodash";
import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import {
  aspectBodies,
  aspects,
  lunarPhases,
  signs,
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

import { TAG_ROOT } from "./tags.constants";
import { classifyEvent } from "./tags.utilities";

import type { TagPath } from "./tags.types";

const AT = "2026-03-20T12:00:00Z";
const BASE = ["Astronomy", "Astrology"];
const ROOTS = new Set<string>(Object.values(TAG_ROOT));
const VISIBILITY = ["Evening Visibility", "Morning Visibility"];

/** The paths an instant with these raw tags is classified under. */
function classify(tags: readonly string[]): TagPath[] {
  return classifyEvent({
    end: moment.utc(AT),
    start: moment.utc(AT),
    tags: [...BASE, ...tags],
  });
}

const PLANETARY_PHASES = [
  ["Venusian", Object.keys(symbolByVenusianPhase)],
  ["Mercurian", Object.keys(symbolByMercurianPhase)],
  ["Martian", Object.keys(symbolByMartianPhase)],
] as const;

const COMPOUND_PATTERNS = [
  ["Triple Aspect", Object.keys(symbolByTripleAspect)],
  ["Quadruple Aspect", Object.keys(symbolByQuadrupleAspect)],
  ["Quintuple Aspect", Object.keys(symbolByQuintupleAspect)],
  ["Sextuple Aspect", Object.keys(symbolBySextupleAspect)],
] as const;

const STELLIUM_SIZES = Array.from(
  { length: Object.keys(symbolByStellium).length },
  (_value, index) => `${String(index + 3)} Body`,
);

const BODIES = aspectBodies.map((body) => bodyDisplayName(body));
const SIGNS = signs.map((sign) => _.startCase(sign));

/** A representative raw tag set for every kind of event a detector emits. */
const DETECTOR_TAG_SETS: readonly (readonly string[])[] = [
  ...PLANETARY_PHASES.flatMap(([marker, phases]) =>
    [...phases.map((phase) => _.startCase(phase)), ...VISIBILITY].map(
      (phase) => ["Planetary Phase", marker, phase],
    ),
  ),
  ...lunarPhases.map((phase) => [
    "Monthly Lunar Cycle",
    "Lunar",
    _.startCase(phase),
  ]),
  ...[
    "Astronomical Dawn",
    "Astronomical Dusk",
    "Civil Dawn",
    "Civil Dusk",
    "Daylight",
    "Nautical Dawn",
    "Nautical Dusk",
    "Night",
  ].map((name) => ["Twilight", name]),
  ...["Astronomical Twilight", "Nautical Twilight"].flatMap((name) =>
    ["Evening", "Morning"].map((time) => ["Twilight", name, time]),
  ),
  ...[
    "Advancing",
    "Aphelion",
    "Autumnal Equinox",
    "Beltane",
    "Eleventh Hexadecan",
    "Fifteenth Hexadecan",
    "Fifth Hexadecan",
    "First Hexadecan",
    "Imbolc",
    "Lammas",
    "Ninth Hexadecan",
    "Perihelion",
    "Retreating",
    "Samhain",
    "Seventh Hexadecan",
    "Summer Solstice",
    "Third Hexadecan",
    "Thirteenth Hexadecan",
    "Vernal Equinox",
    "Winter Solstice",
  ].map((name) => ["Annual Solar Cycle", "Solar", name]),
  ["Daily Solar Cycle", "Solar"],
  ["Daily Lunar Cycle", "Lunar"],
  ...["Apogee", "Perigee"].map((name) => ["Lunar Apsides", "Lunar", name]),
  ...aspects.flatMap((aspect) =>
    ["Forming", "Perfective", "Dissolving"].map((phase) => [
      "Simple Aspect",
      "Major Aspect",
      "Sun",
      "Moon",
      _.startCase(aspect),
      phase,
    ]),
  ),
  ...COMPOUND_PATTERNS.flatMap(([aspectClass, patterns]) =>
    patterns.map((pattern) => [
      "Compound Aspect",
      aspectClass,
      _.startCase(pattern),
      "Forming",
      ...BODIES.slice(0, 3),
      `${BODIES[0] ?? "Sun"} Focal`,
    ]),
  ),
  ...STELLIUM_SIZES.map((size) => [
    "Compound Aspect",
    "Stellium",
    size,
    ...BODIES,
  ]),
  ...Object.values(eclipseTypeLabelByType).flatMap((eclipseType) =>
    ["Beginning", "Maximum", "Ending"].flatMap((phase) =>
      ["Geocentric", "Topocentric Visibility"].flatMap((frame) =>
        ["Lunar", "Solar"].map((body) => [
          "Eclipse",
          body,
          frame,
          eclipseType,
          phase,
        ]),
      ),
    ),
  ),
  ...BODIES.flatMap((body) =>
    SIGNS.flatMap((sign) => [
      ["Ingress", body, sign],
      ["Ingress", "Peak", body, sign],
      ...Object.values(DECAN_TAG_BY_DECAN).map((decan) => [
        "Ingress",
        "Decan",
        decan,
        body,
        sign,
      ]),
    ]),
  ),
  ...BODIES.flatMap((body) => [
    ["Retrogrades", body],
    ["Direction", body, "Retrograde"],
    ["Direction", body, "Direct"],
  ]),
];

describe("tag map vocabulary", () => {
  it("classifies every detector's raw tags under the dimension roots", () => {
    const strays = DETECTOR_TAG_SETS.flatMap((tags) =>
      classify(tags)
        .filter(([root]) => !ROOTS.has(root))
        .map((path) => `${tags.join(", ")}: ${path.join(" > ")}`),
    );

    expect(strays).toStrictEqual([]);
  });

  it("never gives an event the same leaf name twice", () => {
    const repeated = DETECTOR_TAG_SETS.filter((tags) => {
      const leaves = classify(tags).map((path) => path.at(-1));
      return new Set(leaves).size !== leaves.length;
    });

    expect(repeated).toStrictEqual([]);
  });

  it("gives every compound pattern a nature and a harmonic", () => {
    const unclassified = [
      ...COMPOUND_PATTERNS.flatMap(([, patterns]) => patterns),
      "stellium",
    ]
      .map((pattern) => _.startCase(pattern))
      .filter((pattern) => {
        const roots = new Set(
          classify(["Compound Aspect", pattern]).map(([root]) => root),
        );
        return (
          !roots.has(TAG_ROOT.aspectNature) ||
          !roots.has(TAG_ROOT.aspectHarmonic)
        );
      });

    expect(unclassified).toStrictEqual([]);
  });

  it.each(["Full", "Opposition"])(
    "files Mars's %s under the Opposition stage",
    (phase) => {
      expect(
        classify(["Planetary Phase", "Martian", phase]).filter(
          ([root]) => root === TAG_ROOT.synodicStage,
        ),
      ).toStrictEqual([[TAG_ROOT.synodicStage, "Opposition"]]);
    },
  );

  it("keeps Venus full at a conjunction", () => {
    expect(
      classify(["Planetary Phase", "Venusian", "Full"]).filter(
        ([root]) => root === TAG_ROOT.synodicStage,
      ),
    ).toStrictEqual([[TAG_ROOT.synodicStage, "Conjunction"]]);
  });
});
