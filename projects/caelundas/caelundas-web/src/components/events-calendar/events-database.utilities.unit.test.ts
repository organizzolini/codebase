import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";

const STAMP = "'2026-01-01T00:00:00.000Z'";
const FORMING_SQL = `
  insert into tags (id, created_at, updated_at, "name", parent_id) values
    ('tag-phase', ${STAMP}, ${STAMP}, 'Phase', null),
    ('tag-forming', ${STAMP}, ${STAMP}, 'Forming', 'tag-phase');
  insert into tags_closure (ancestor_id, descendant_id) values
    ('tag-phase', 'tag-phase'),
    ('tag-forming', 'tag-forming'),
    ('tag-phase', 'tag-forming');
  insert into calendar_events (id, created_at, updated_at, color, description, "end", latitude, "location", longitude, "start", "summary", timezone) values
    ('event-forming', ${STAMP}, ${STAMP}, null, 'Mars forming square Saturn', '2026-04-10T20:00:00.000Z', 40.7128, 'New York, NY', -74.006, '2026-04-10T20:00:00.000Z', 'Mars Square Saturn', 'America/New_York');
  insert into calendar_event_tags (calendar_event_id, tag_id) values
    ('event-forming', 'tag-forming');
`;

describe("the events database", () => {
  it("leaves out the instants where an aspect begins forming", async () => {
    const database = createTestEventsDatabase({ extraSql: FORMING_SQL });

    const events = await database.findEvents({
      window: {
        end: new Date("2026-04-11T00:00:00.000Z"),
        start: new Date("2026-04-10T00:00:00.000Z"),
      },
    });

    expect(events.map((event) => event.id)).toStrictEqual([
      "event-mars-square-saturn",
    ]);
  });

  it("reads the night sky's stars, brightest first, and its figures", async () => {
    const { segments, stars } = await createTestEventsDatabase().findNightSky();
    const magnitudes = stars.map((star) => star[2]);

    expect(stars.length).toBeGreaterThan(100);
    expect(magnitudes).toStrictEqual(magnitudes.toSorted((a, b) => a - b));
    expect(segments).toContainEqual(
      expect.objectContaining({ name: "Ursa Major", zodiac: false }),
    );
    expect(
      new Set(segments.filter((s) => s.zodiac).map((s) => s.name)).size,
    ).toBe(12);
  });

  it("reads no night sky from tables that hold nothing", async () => {
    await expect(
      createTestEventsDatabase({ empty: true }).findNightSky(),
    ).resolves.toStrictEqual({ segments: [], stars: [] });
  });

  it("lists every constellation by name, the zodiac's marked", async () => {
    const constellations =
      await createTestEventsDatabase().findConstellations();

    expect(constellations).toHaveLength(88);
    expect(constellations).toContainEqual({ name: "Leo", zodiac: true });
    expect(constellations).toContainEqual({
      name: "Ursa Major",
      zodiac: false,
    });
  });
});
