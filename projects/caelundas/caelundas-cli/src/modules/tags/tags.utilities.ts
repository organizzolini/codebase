import { bodyFromDisplayName, isSign } from "../caelundas/caelundas.types";

import { SIGNS_BY_DIGNITY_BY_PLANET } from "./tag-dimensions.constants";
import {
  CONTEXT_TAG_MAPS,
  ECLIPSE_TYPE_NAMES,
  SHARED_TAG_MAP,
} from "./tag-map.constants";
import { TAG_ROOT } from "./tags.constants";

import type { ClassifiableEvent, TagMap, TagPath } from "./tags.types";

/**
 * The tree nodes an event is linked to, each as the path from its root down
 * to it. Each raw tag is looked up in the shared map and in the map of
 * every kind of event the event is marked as; a raw tag no map knows falls
 * back to a root of its own. Paths no single raw tag gives are derived from
 * several, and only the deepest node of each branch is kept.
 */
export function classifyEvent(event: ClassifiableEvent): TagPath[] {
  const rawTags = new Set(event.tags);
  const maps = [
    SHARED_TAG_MAP,
    ...[...rawTags].flatMap((rawTag) => {
      const map = CONTEXT_TAG_MAPS[rawTag];
      return map === undefined ? [] : [map];
    }),
  ];

  return pruneAncestorPaths([
    ...[...rawTags].flatMap((rawTag) => mapRawTag(rawTag, maps)),
    ...ingressPaths(event, rawTags),
    ...eclipsePaths(rawTags),
    [TAG_ROOT.temporality, isInstant(event) ? "Instant" : "Duration"],
  ]);
}

/**
 * The key a node is found by among the nodes already stored: its parent and
 * its own name, which together are unique, because a name is unique among
 * its siblings.
 */
export function tagNodeKey(parentId: null | string, name: string): string {
  return `${parentId ?? ""}\u0000${name}`;
}

/** The key a path is told apart by: its names, in order. */
export function tagPathKey(path: TagPath): string {
  return path.join("\u0000");
}

/**
 * The dignity of a traditional planet in the sign an ingress names: the
 * strongest dignity that lists the sign, or peregrine when none does. A body
 * outside the seven traditional planets has no dignity.
 */
function dignityPaths(rawTags: ReadonlySet<string>): TagPath[] {
  const planet = [...rawTags]
    .map((rawTag) => bodyFromDisplayName(rawTag))
    .find((body) => body !== undefined && body in SIGNS_BY_DIGNITY_BY_PLANET);
  const sign = [...rawTags]
    .map((rawTag) => rawTag.toLowerCase())
    .find((name) => isSign(name));
  const dignities =
    planet === undefined ? undefined : SIGNS_BY_DIGNITY_BY_PLANET[planet];

  if (dignities === undefined || sign === undefined || !isSign(sign)) {
    return [];
  }

  const [dignity] = dignities.find(([, signs]) => signs.includes(sign)) ?? [
    "Peregrine",
  ];

  return [[TAG_ROOT.dignity, dignity]];
}

/** An eclipse's kind, from the body eclipsed and the eclipse's type. */
function eclipsePaths(rawTags: ReadonlySet<string>): TagPath[] {
  const body = findRawTag(rawTags, ["Lunar", "Solar"]);

  if (!rawTags.has("Eclipse") || body === undefined) {
    return [];
  }

  const eclipse = `${body} Eclipse`;
  const eclipseType = findRawTag(rawTags, ECLIPSE_TYPE_NAMES);

  return [
    eclipseType === undefined
      ? [TAG_ROOT.type, "Eclipse", eclipse]
      : [TAG_ROOT.type, "Eclipse", eclipse, `${eclipseType} ${eclipse}`],
  ];
}

/** The raw tag of `rawTags` that is one of `names`, if any. */
function findRawTag(
  rawTags: ReadonlySet<string>,
  names: readonly string[],
): string | undefined {
  return names.find((name) => rawTags.has(name));
}

/** The kind of ingress an ingress event is. */
function ingressKind(
  event: ClassifiableEvent,
  rawTags: ReadonlySet<string>,
): string {
  if (rawTags.has("Decan")) {
    return "Decan Ingress";
  }
  if (rawTags.has("Peak")) {
    return "Peak Ingress";
  }
  return isInstant(event) ? "Sign Ingress" : "Sign Transit";
}

/**
 * An ingress's kind, which no one raw tag says: a decan or peak ingress is
 * marked, and a plain sign ingress is an instant where its stay in the sign
 * is a span. A traditional planet's ingress also carries its dignity.
 */
function ingressPaths(
  event: ClassifiableEvent,
  rawTags: ReadonlySet<string>,
): TagPath[] {
  if (!rawTags.has("Ingress")) {
    return [];
  }

  return [
    [TAG_ROOT.type, "Ingress", ingressKind(event, rawTags)],
    ...dignityPaths(rawTags),
  ];
}

/** Whether an event is a single moment rather than a span. */
function isInstant(event: ClassifiableEvent): boolean {
  return event.start.valueOf() === event.end.valueOf();
}

/**
 * The paths a raw tag stands for in the maps that apply to its event, or a
 * root named for itself when no map knows it, so a new detector tag never
 * breaks ingestion.
 */
function mapRawTag(rawTag: string, maps: readonly TagMap[]): TagPath[] {
  const known = maps.filter((map) => Object.hasOwn(map, rawTag));

  if (known.length === 0) {
    return [[rawTag]];
  }

  return known.flatMap((map) => map[rawTag] ?? []);
}

/**
 * Drops repeated paths and every path another one runs through, as the
 * deeper path carries its ancestors already, and sorts what is left.
 */
function pruneAncestorPaths(paths: readonly TagPath[]): TagPath[] {
  const byKey = new Map(paths.map((path) => [tagPathKey(path), path]));
  const keys = [...byKey.keys()];

  return [...byKey.entries()]
    .filter(([key]) => !keys.some((other) => other.startsWith(`${key}\u0000`)))
    .toSorted(([a], [b]) => (a < b ? -1 : 1))
    .map(([, path]) => path);
}
