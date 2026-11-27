import { bodyFromDisplayName, isSign } from "../caelundas/caelundas.types";

import { TAG_EXTRA_PARENTS } from "./modules/tag-metadata/tag-metadata-parents.constants";
import { TAG_CHILD_RANKS } from "./modules/tag-metadata/tag-metadata-rank.constants";
import { SIGNS_BY_DIGNITY_BY_PLANET } from "./tag-dimensions.constants";
import {
  CONTEXT_TAG_MAPS,
  ECLIPSE_TYPE_NAMES,
  SHARED_TAG_MAP,
} from "./tag-map.constants";
import { TAG_ROOT } from "./tags.constants";

import type { ClassifiableEvent, TagMap, TagPath } from "./tags.types";

/**
 * The tree nodes an event links to, as root-to-node paths; a raw tag no map knows becomes a root of its own.
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
    [TAG_ROOT.temporality, isInstant(event) ? "Perfective" : "Progressive"],
  ]);
}

/** The key an edge is told apart by: its parent and child ids. */
export function tagEdgeKey(parentId: string, childId: string): string {
  return `${parentId}\u0000${childId}`;
}

/** The other parents the node at `path` sits under, each as a path; none for most nodes. */
export function tagExtraParents(path: TagPath): readonly TagPath[] {
  return TAG_EXTRA_PARENTS[path.join(" / ")] ?? [];
}

/**
 * The key a node is found by among stored nodes: its parent and name, unique because names are unique among siblings.
 */
export function tagNodeKey(parentId: null | string, name: string): string {
  return `${parentId ?? ""}\u0000${name}`;
}

/** The key a path is told apart by: its names, in order. */
export function tagPathKey(path: TagPath): string {
  return path.join("\u0000");
}

/**
 * Where a node sits among its siblings: its place, from 1, in its parent's list in `TAG_CHILD_RANKS`, or 0 when it is not listed.
 */
export function tagRank(path: readonly string[]): number {
  const siblings = TAG_CHILD_RANKS[path.slice(0, -1).join(" / ")];
  const index = siblings?.indexOf(path.at(-1) ?? "") ?? -1;

  return index + 1;
}

/**
 * A tag name as its `tags.slug` column holds it: lowercase, runs of other
 * characters as one `-`, trimmed. Throws when nothing is left.
 */
export function tagSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replaceAll(/[^a-z\d]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");

  if (slug === "") {
    throw new Error(
      `🚫 The tag name "${name}" has no letters or digits to slug.`,
    );
  }

  return slug;
}

/**
 * The dignity of a traditional planet in the sign an ingress names: the strongest listing dignity, or peregrine.
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

  return [[TAG_ROOT.zodiac, "Dignity", dignity]];
}

/** An eclipse's kind, from the body eclipsed and the eclipse's type. */
function eclipsePaths(rawTags: ReadonlySet<string>): TagPath[] {
  const body = findRawTag(rawTags, ["Lunar", "Solar"]);

  if (!rawTags.has("Eclipse") || body === undefined) {
    return [];
  }

  const eclipseType = findRawTag(rawTags, ECLIPSE_TYPE_NAMES);

  return [
    eclipseType === undefined
      ? [TAG_ROOT.eclipse, body]
      : [TAG_ROOT.eclipse, body, eclipseType],
  ];
}

/** The raw tag of `rawTags` that is one of `names`, if any. */
function findRawTag(
  rawTags: ReadonlySet<string>,
  names: readonly string[],
): string | undefined {
  return names.find((name) => rawTags.has(name));
}

/** The kind of ingress an ingress event is, or of stay when it is a span. */
function ingressKind(
  event: ClassifiableEvent,
  rawTags: ReadonlySet<string>,
): string {
  if (rawTags.has("Decan")) {
    return isInstant(event) ? "Decan Ingress" : "Decan Transit";
  }
  if (rawTags.has("Peak")) {
    return isInstant(event) ? "Peak Ingress" : "Peak Transit";
  }
  return isInstant(event) ? "Sign Ingress" : "Sign Transit";
}

/**
 * A plain sign ingress is an instant, where its stay is a span; a traditional planet's ingress also carries dignity.
 */
function ingressPaths(
  event: ClassifiableEvent,
  rawTags: ReadonlySet<string>,
): TagPath[] {
  if (!rawTags.has("Ingress")) {
    return [];
  }

  return [
    [TAG_ROOT.zodiac, "Ingress", ingressKind(event, rawTags)],
    ...dignityPaths(rawTags),
  ];
}

/** Whether an event is a single moment rather than a span. */
function isInstant(event: ClassifiableEvent): boolean {
  return event.start.valueOf() === event.end.valueOf();
}

/**
 * Paths a raw tag stands for in the maps that apply, or a root named for itself when none knows it.
 */
function mapRawTag(rawTag: string, maps: readonly TagMap[]): TagPath[] {
  const known = maps
    .filter((map) => Object.hasOwn(map, rawTag))
    .map((map) => map[rawTag])
    .filter((paths) => paths !== undefined);

  if (known.length === 0) {
    return [[rawTag]];
  }

  return known.flat();
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
