// The calendar the mocked API serves: a few weeks around March 2026 with a gap until late June, one New York observer, a tag tree.
// Short ids, such as `tag-mars`, stand in for database uuids.

/**
 * A fixture event, with the tags it was given directly.
 */
export interface FixtureEvent {
  end: string;
  id: string;
  name: string;
  note: string;
  start: string;
  tagIds: readonly string[];
  timezone: string;
}

/**
 * One node of the tag tree; a root has no parent.
 */
export interface FixtureTag {
  /**
   * The other parents of a tag under several, as Venus is under Benefic too.
   */
  alsoParentIds?: readonly string[];
  id: string;
  name: string;
  parentId: null | string;
}

const NEW_YORK = {
  timezone: "America/New_York",
} as const;

export const FIXTURE_TAGS: readonly FixtureTag[] = [
  { id: "tag-aspect", name: "Aspect", parentId: null },
  { id: "tag-simple", name: "Simple", parentId: "tag-aspect" },
  { id: "tag-major", name: "Major", parentId: "tag-simple" },
  { id: "tag-conjunct", name: "Conjunct", parentId: "tag-major" },
  { id: "tag-square", name: "Square", parentId: "tag-major" },
  { id: "tag-planetary", name: "Planetary", parentId: null },
  { id: "tag-direction", name: "Direction", parentId: "tag-planetary" },
  {
    id: "tag-retrograde",
    name: "Retrograde Period",
    parentId: "tag-direction",
  },
  { id: "tag-body", name: "Body", parentId: null },
  { id: "tag-sun", name: "Sun", parentId: "tag-body" },
  { id: "tag-mercury", name: "Mercury", parentId: "tag-body" },
  { id: "tag-venus", name: "Venus", parentId: "tag-body" },
  { id: "tag-mars", name: "Mars", parentId: "tag-body" },
  { id: "tag-saturn", name: "Saturn", parentId: "tag-body" },
  { id: "tag-zodiac", name: "Zodiac", parentId: null },
  { id: "tag-ingress", name: "Ingress", parentId: "tag-zodiac" },
  { id: "tag-aries", name: "Aries", parentId: "tag-zodiac" },
  { id: "tag-element", name: "Element", parentId: null },
  { id: "tag-fire", name: "Fire", parentId: "tag-element" },
];

export const FIXTURE_EVENTS: readonly FixtureEvent[] = [
  {
    end: "2026-03-20T19:32:00.000Z",
    id: "event-mercury-retrograde",
    name: "Mercury Retrograde",
    note: "Mercury appears to move backward through the zodiac",
    start: "2026-02-26T06:48:00.000Z",
    tagIds: ["tag-retrograde", "tag-mercury"],
    ...NEW_YORK,
  },
  {
    end: "2026-03-04T15:20:00.000Z",
    id: "event-mars-conjunct-venus",
    name: "Mars Conjunct Venus",
    note: "Mars and Venus meet at the same zodiacal longitude",
    start: "2026-03-04T15:20:00.000Z",
    tagIds: ["tag-conjunct", "tag-mars", "tag-venus"],
    ...NEW_YORK,
  },
  {
    end: "2026-03-20T14:46:00.000Z",
    id: "event-sun-ingress-aries",
    name: "Sun Ingress Aries",
    note: "The Sun enters Aries at the vernal equinox",
    start: "2026-03-20T14:46:00.000Z",
    tagIds: ["tag-ingress", "tag-sun", "tag-aries", "tag-fire"],
    ...NEW_YORK,
  },
  {
    end: "2026-03-26T03:12:00.000Z",
    id: "event-venus-ingress-aries",
    name: "Venus Ingress Aries",
    note: "Venus enters Aries",
    start: "2026-03-26T03:12:00.000Z",
    tagIds: ["tag-ingress", "tag-venus", "tag-aries", "tag-fire"],
    ...NEW_YORK,
  },
  {
    end: "2026-04-10T22:05:00.000Z",
    id: "event-mars-square-saturn",
    name: "Mars Square Saturn",
    note: "Mars and Saturn stand ninety degrees apart",
    start: "2026-04-10T22:05:00.000Z",
    tagIds: ["tag-square", "tag-mars", "tag-saturn"],
    ...NEW_YORK,
  },
  {
    end: "2026-06-21T08:24:00.000Z",
    id: "event-sun-ingress-cancer",
    name: "Sun Ingress Cancer",
    note: "The Sun enters Cancer at the summer solstice",
    start: "2026-06-21T08:24:00.000Z",
    tagIds: ["tag-ingress", "tag-sun"],
    ...NEW_YORK,
  },
];
/**
 * A run of `count` instant events a minute apart from a UTC instant, named "Busy Event 1" onward, with no tag.
 */
export function createBusyEvents(start: string, count: number): FixtureEvent[] {
  const first = new Date(start).getTime();

  return Array.from({ length: count }, (_, index) => {
    const at = new Date(first + index * 60_000).toISOString();

    return {
      end: at,
      id: `event-busy-${String(index + 1)}`,
      name: `Busy Event ${String(index + 1)}`,
      note: "A busy moment",
      start: at,
      tagIds: [],
      ...NEW_YORK,
    };
  });
}

/**
 * The tree with Venus and Mars each under two parents.
 */
export const DAG_FIXTURE_TAGS: readonly FixtureTag[] = [
  ...FIXTURE_TAGS.map((tag) =>
    tag.id === "tag-venus"
      ? { ...tag, alsoParentIds: ["tag-benefic"] }
      : tag.id === "tag-mars"
        ? { ...tag, alsoParentIds: ["tag-malefic"] }
        : tag,
  ),
  { id: "tag-benefic", name: "Benefic", parentId: "tag-body" },
  { id: "tag-malefic", name: "Malefic", parentId: "tag-body" },
];
