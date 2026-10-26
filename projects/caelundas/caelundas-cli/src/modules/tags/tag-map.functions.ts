import _ from "lodash";

import {
  ELEMENT_BY_SIGN,
  MODALITY_BY_SIGN,
  POLARITY_BY_ELEMENT,
  SYNODIC_STAGE_BY_PHASE,
} from "./tag-dimensions.constants";
import { TAG_ROOT } from "./tags.constants";

import type { Sign } from "../caelundas/caelundas.types";
import type { TagMap, TagPath } from "./tags.types";

/**
 * A map from each class under `parent`, and each name in it, to its node:
 * the class beneath `parent` and each name beneath its class. Names are
 * title-cased, as detectors tag them.
 */
export function mapClasses(
  parent: TagPath,
  classes: readonly (readonly [string, readonly string[]])[],
): TagMap {
  return Object.fromEntries(
    classes.flatMap(([className, names]) => {
      const classPath: TagPath = [...parent, className];
      return [
        [className, one(classPath)],
        ...Object.entries(
          mapEach(
            names.map((name) => _.startCase(name)),
            (name) => [...classPath, name],
          ),
        ),
      ];
    }),
  );
}

/** A map from each name to the one node `toPath` puts it at. */
export function mapEach(
  names: readonly string[],
  toPath: (name: string) => TagPath,
): TagMap {
  return Object.fromEntries(
    names.map((name): [string, readonly TagPath[]] => [
      name,
      one(toPath(name)),
    ]),
  );
}

/** A map from each name to no node at all, as it classifies nothing. */
export function mapNone(names: readonly string[]): TagMap {
  return Object.fromEntries(
    names.map((name): [string, readonly TagPath[]] => [name, []]),
  );
}

/**
 * The raw tags of one planet's phase events, keyed by the raw tag that marks
 * them as that planet's, such as `Venusian`: the marker types the event as
 * the planet's planetary phase and carries `planetPaths`, the planet's own
 * nodes, and each phase is typed beneath it with its stage of the cycle,
 * from `stageByPhase` where the planet's stages differ.
 */
export function mapPlanetaryPhases(args: {
  marker: string;
  phases: readonly string[];
  planetPaths: readonly TagPath[];
  stageByPhase?: Readonly<Record<string, string>>;
}): TagMap {
  const { marker, phases, planetPaths, stageByPhase = {} } = args;
  const markerPath: TagPath = [TAG_ROOT.type, "Planetary Phase", marker];

  return {
    [marker]: [markerPath, ...planetPaths],
    ...Object.fromEntries(
      phases.map((phase): [string, readonly TagPath[]] => {
        const name = _.startCase(phase);
        const stage =
          stageByPhase[phase] ?? SYNODIC_STAGE_BY_PHASE[phase] ?? name;
        // A phase named like its stage, such as Mars's conjunction, takes
        // its planet's name, so an event never carries one name twice.
        const leaf = name === stage ? `${marker} ${name}` : name;
        return [
          name,
          [
            [...markerPath, leaf],
            [TAG_ROOT.synodicStage, stage],
          ],
        ];
      }),
    ),
  };
}

/** One map holding every path each raw tag has in any of `maps`. */
export function mergeTagMaps(...maps: readonly TagMap[]): TagMap {
  const merged = new Map<string, TagPath[]>();

  for (const map of maps) {
    for (const [rawTag, paths] of Object.entries(map)) {
      merged.set(rawTag, [...(merged.get(rawTag) ?? []), ...paths]);
    }
  }

  return Object.fromEntries(merged);
}

/** The nodes an aspect's nature and harmonic stand for, as roots of their own. */
export function natureAndHarmonicPaths([nature, harmonic]: readonly [
  string,
  number,
]): readonly TagPath[] {
  return [
    [TAG_ROOT.aspectNature, nature],
    [TAG_ROOT.aspectHarmonic, `Harmonic ${String(harmonic)}`],
  ];
}

/** A raw tag that stands for exactly one node. */
export function one(path: TagPath): readonly TagPath[] {
  return [path];
}

/**
 * The nodes a sign stands for: the sign itself, and beside it, as roots of
 * their own, the element, modality and polarity it implies.
 */
export function signPaths(sign: Sign): readonly TagPath[] {
  const element = ELEMENT_BY_SIGN[sign];

  return [
    [TAG_ROOT.sign, _.startCase(sign)],
    [TAG_ROOT.element, element],
    [TAG_ROOT.modality, MODALITY_BY_SIGN[sign]],
    [TAG_ROOT.polarity, POLARITY_BY_ELEMENT[element] ?? element],
  ];
}
