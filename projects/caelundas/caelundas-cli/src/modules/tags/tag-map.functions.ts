import _ from "lodash";

import { bodyDisplayName } from "../caelundas/caelundas.types";

import {
  BODY_CLASS_BY_BODY,
  ELEMENT_BY_SIGN,
  MODALITY_BY_SIGN,
  POLARITY_BY_ELEMENT,
  SYNODIC_STAGE_BY_PHASE,
} from "./tag-dimensions.constants";
import { TAG_ROOT } from "./tags.constants";

import type { Body, Sign } from "../caelundas/caelundas.types";
import type { TagMap, TagPath } from "./tags.types";

/** The one node a body's raw tag stands for, under its class. */
export function bodyPaths(body: Body): readonly TagPath[] {
  return [[TAG_ROOT.body, ...BODY_CLASS_BY_BODY[body], bodyDisplayName(body)]];
}

/**
 * Maps each class under `parent`, and each name in it, to its node, title-cased.
 */
export function mapClasses(
  parent: TagPath,
  classes: readonly (readonly [string, readonly string[]])[],
): TagMap {
  return Object.fromEntries(
    classes.flatMap(([className, names]) => {
      const classPath: TagPath = [
        ...parent,
        className.replace(/ Aspect$/u, ""),
      ];
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
 * Raw tags of one planet's phase events, keyed by the marker tag such as `Venusian`; each stage sits under its planet, so planets share stage names.
 */
export function mapPlanetaryPhases(args: {
  marker: string;
  phases: readonly string[];
  planet: string;
  planetPaths: readonly TagPath[];
  stageByPhase?: Readonly<Record<string, string>>;
}): TagMap {
  const { marker, phases, planet, planetPaths, stageByPhase = {} } = args;
  const markerPath: TagPath = [TAG_ROOT.planetary, "Phase", marker];

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
            [TAG_ROOT.planetary, "Synodic Stage", planet, stage],
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

/** The nodes an aspect's nature and harmonic stand for; both sit under Aspect. */
export function natureAndHarmonicPaths([nature, harmonic]: readonly [
  string,
  number,
]): readonly TagPath[] {
  return [
    [TAG_ROOT.aspect, "Nature", nature],
    [TAG_ROOT.aspect, "Harmonic", `Harmonic ${String(harmonic)}`],
  ];
}

/** A raw tag that stands for exactly one node. */
export function one(path: TagPath): readonly TagPath[] {
  return [path];
}

/**
 * The nodes a sign stands for: the sign itself, and beside it, in the Sign root,
 * the element, modality and polarity it implies.
 */
export function signPaths(sign: Sign): readonly TagPath[] {
  const element = ELEMENT_BY_SIGN[sign];

  return [
    [TAG_ROOT.sign, "Sign", _.startCase(sign)],
    [TAG_ROOT.sign, "Element", element],
    [TAG_ROOT.sign, "Modality", MODALITY_BY_SIGN[sign]],
    [TAG_ROOT.sign, "Polarity", POLARITY_BY_ELEMENT[element]],
  ];
}
