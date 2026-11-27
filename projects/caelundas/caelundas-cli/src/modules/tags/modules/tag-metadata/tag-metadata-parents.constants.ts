// ♟️ Constants
import _ from "lodash";

import {
  bodies,
  majorAspects,
  minorAspects,
  signs,
  specialtyAspects,
} from "../../../caelundas/caelundas.constants";
import {
  FORTUNE_BY_PLANET,
  KIND_AND_SEASON_BY_SOLAR_CYCLE_POINT,
  NATURE_AND_HARMONIC_BY_ASPECT,
  NATURE_AND_HARMONIC_BY_PATTERN,
} from "../../tag-dimensions.constants";
import { COMPOUND_CLASSES } from "../../tag-map.constants";
import {
  bodyPaths,
  natureAndHarmonicPaths,
  signPaths,
} from "../../tag-map.functions";
import { TAG_ROOT } from "../../tags.constants";

import type { TagPath } from "../../tags.types";

/** The simple aspect classes and the aspects each holds. */
const SIMPLE_CLASSES = [
  ["Major", majorAspects],
  ["Minor", minorAspects],
  ["Specialty", specialtyAspects],
] as const;

/** A compound pattern's node and its nature and harmonic, for each pattern the nature table lists. */
const PATTERN_ENTRIES = COMPOUND_CLASSES.flatMap(
  ([className, names]): [string, readonly TagPath[]][] => {
    const label = className.replace(/ Aspect$/u, "");
    const classPath: TagPath = [TAG_ROOT.aspect, "Compound", label];
    const nodes = [
      classPath,
      ...names.map((name): TagPath => [...classPath, _.startCase(name)]),
    ];

    return nodes.flatMap((node) => {
      const entry = NATURE_AND_HARMONIC_BY_PATTERN[node.at(-1) ?? ""];

      return entry === undefined
        ? []
        : [[node.join(" / "), natureAndHarmonicPaths(entry)]];
    });
  },
);

/**
 * Other parents of a tag, by its path, each as a path: the sign groups of a sign, the nature and harmonic of an aspect, the fortune of a planet and the season of a solar point. Events carry the child already, so a group only counts through it.
 */
export const TAG_EXTRA_PARENTS: Readonly<
  Record<string, readonly (readonly [string, ...string[]])[]>
> = Object.fromEntries([
  ...signs.map((sign): [string, readonly TagPath[]] => {
    const [node, ...groups] = signPaths(sign);

    return [(node ?? []).join(" / "), groups];
  }),
  ...SIMPLE_CLASSES.flatMap(([className, names]) =>
    names.map((aspect): [string, readonly TagPath[]] => [
      [TAG_ROOT.aspect, "Simple", className, _.startCase(aspect)].join(" / "),
      natureAndHarmonicPaths(NATURE_AND_HARMONIC_BY_ASPECT[aspect]),
    ]),
  ),
  ...PATTERN_ENTRIES,
  ...bodies.flatMap((body) => {
    const fortune = FORTUNE_BY_PLANET[body];

    return fortune === undefined
      ? []
      : bodyPaths(body).map((path): [string, readonly TagPath[]] => [
          path.join(" / "),
          [[TAG_ROOT.body, "Planet", fortune]],
        ]);
  }),
  ...Object.entries(KIND_AND_SEASON_BY_SOLAR_CYCLE_POINT).map(
    ([name, [kind, season]]): [string, readonly TagPath[]] => [
      [TAG_ROOT.solar, "Annual Cycle", kind, name].join(" / "),
      [[TAG_ROOT.solar, "Season", season]],
    ],
  ),
]);
