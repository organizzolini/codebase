// The calendar the mocked API serves: a few weeks of events around March
// 2026, then a gap until late June, for one observer in New York, under a tag
// tree of types, planets, signs and elements. The ids are short names, so a
// test reads `tag-mars` where a database would hold a uuid.

/**
 * One event as the mocked API stores it, with the tags it was given directly.
 */
export interface FixtureEvent {
  color: null | string;
  description: string;
  end: string;
  id: string;
  location: string;
  start: string;
  summary: string;
  tagIds: readonly string[];
  timezone: string;
}

/**
 * One node of the tag tree; a root has no parent.
 */
export interface FixtureTag {
  id: string;
  name: string;
  parentId: null | string;
}

const NEW_YORK = {
  location: "New York, NY",
  timezone: "America/New_York",
} as const;

export const FIXTURE_TAGS: readonly FixtureTag[] = [
  { id: "tag-type", name: "Type", parentId: null },
  { id: "tag-aspect", name: "Aspect", parentId: "tag-type" },
  { id: "tag-major-aspect", name: "Major Aspect", parentId: "tag-aspect" },
  { id: "tag-conjunct", name: "Conjunct", parentId: "tag-major-aspect" },
  { id: "tag-square", name: "Square", parentId: "tag-major-aspect" },
  { id: "tag-ingress", name: "Ingress", parentId: "tag-type" },
  { id: "tag-retrograde", name: "Retrograde", parentId: "tag-type" },
  { id: "tag-planet", name: "Planet", parentId: null },
  { id: "tag-sun", name: "Sun", parentId: "tag-planet" },
  { id: "tag-mercury", name: "Mercury", parentId: "tag-planet" },
  { id: "tag-venus", name: "Venus", parentId: "tag-planet" },
  { id: "tag-mars", name: "Mars", parentId: "tag-planet" },
  { id: "tag-saturn", name: "Saturn", parentId: "tag-planet" },
  { id: "tag-sign", name: "Sign", parentId: null },
  { id: "tag-aries", name: "Aries", parentId: "tag-sign" },
  { id: "tag-element", name: "Element", parentId: null },
  { id: "tag-fire", name: "Fire", parentId: "tag-element" },
];

export const FIXTURE_EVENTS: readonly FixtureEvent[] = [
  {
    color: null,
    description: "Mercury appears to move backward through the zodiac",
    end: "2026-03-20T19:32:00.000Z",
    id: "event-mercury-retrograde",
    start: "2026-02-26T06:48:00.000Z",
    summary: "Mercury Retrograde",
    tagIds: ["tag-retrograde", "tag-mercury"],
    ...NEW_YORK,
  },
  {
    color: "#b91c1c",
    description: "Mars and Venus meet at the same zodiacal longitude",
    end: "2026-03-04T15:20:00.000Z",
    id: "event-mars-conjunct-venus",
    start: "2026-03-04T15:20:00.000Z",
    summary: "Mars Conjunct Venus",
    tagIds: ["tag-conjunct", "tag-mars", "tag-venus"],
    ...NEW_YORK,
  },
  {
    color: null,
    description: "The Sun enters Aries at the vernal equinox",
    end: "2026-03-20T14:46:00.000Z",
    id: "event-sun-ingress-aries",
    start: "2026-03-20T14:46:00.000Z",
    summary: "Sun Ingress Aries",
    tagIds: ["tag-ingress", "tag-sun", "tag-aries", "tag-fire"],
    ...NEW_YORK,
  },
  {
    color: null,
    description: "Venus enters Aries",
    end: "2026-03-26T03:12:00.000Z",
    id: "event-venus-ingress-aries",
    start: "2026-03-26T03:12:00.000Z",
    summary: "Venus Ingress Aries",
    tagIds: ["tag-ingress", "tag-venus", "tag-aries", "tag-fire"],
    ...NEW_YORK,
  },
  {
    color: null,
    description: "Mars and Saturn stand ninety degrees apart",
    end: "2026-04-10T22:05:00.000Z",
    id: "event-mars-square-saturn",
    start: "2026-04-10T22:05:00.000Z",
    summary: "Mars Square Saturn",
    tagIds: ["tag-square", "tag-mars", "tag-saturn"],
    ...NEW_YORK,
  },
  {
    color: null,
    description: "The Sun enters Cancer at the summer solstice",
    end: "2026-06-21T08:24:00.000Z",
    id: "event-sun-ingress-cancer",
    start: "2026-06-21T08:24:00.000Z",
    summary: "Sun Ingress Cancer",
    tagIds: ["tag-ingress", "tag-sun"],
    ...NEW_YORK,
  },
];

/**
 * A run of instant events in the fixture's zone, `count` of them a minute
 * apart from a UTC instant, named "Busy Event 1" onward and carrying no tag.
 */
export function createBusyEvents(start: string, count: number): FixtureEvent[] {
  const first = new Date(start).getTime();

  return Array.from({ length: count }, (_, index) => {
    const at = new Date(first + index * 60_000).toISOString();

    return {
      color: null,
      description: "A busy moment",
      end: at,
      id: `event-busy-${String(index + 1)}`,
      start: at,
      summary: `Busy Event ${String(index + 1)}`,
      tagIds: [],
      ...NEW_YORK,
    };
  });
}
