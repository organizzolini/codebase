-- A few weeks of events around March 2026, then a gap until late June, for
-- one observer in New York, in the tables `events-schema.sql` creates. Tests
-- and the development build load this text instead of a committed binary
-- file.

insert into tags (id, created_at, updated_at, "name", parent_id) values
    ('tag-type', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Type', null),
    ('tag-aspect', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Aspect', 'tag-type'),
    ('tag-major-aspect', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Major Aspect', 'tag-aspect'),
    ('tag-conjunct', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Conjunct', 'tag-major-aspect'),
    ('tag-square', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Square', 'tag-major-aspect'),
    ('tag-ingress', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Ingress', 'tag-type'),
    ('tag-retrograde', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Retrograde', 'tag-type'),
    ('tag-planet', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Planet', null),
    ('tag-sun', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Sun', 'tag-planet'),
    ('tag-mercury', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Mercury', 'tag-planet'),
    ('tag-venus', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Venus', 'tag-planet'),
    ('tag-mars', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Mars', 'tag-planet'),
    ('tag-saturn', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Saturn', 'tag-planet'),
    ('tag-sign', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Sign', null),
    ('tag-aries', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Aries', 'tag-sign'),
    ('tag-element', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Element', null),
    ('tag-fire', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Fire', 'tag-element');

-- Every node is its own ancestor, as TypeORM writes a closure table.
insert into tags_closure (ancestor_id, descendant_id)
select id, id from tags;

insert into tags_closure (ancestor_id, descendant_id) values
    ('tag-type', 'tag-aspect'),
    ('tag-type', 'tag-major-aspect'),
    ('tag-type', 'tag-conjunct'),
    ('tag-type', 'tag-square'),
    ('tag-type', 'tag-ingress'),
    ('tag-type', 'tag-retrograde'),
    ('tag-aspect', 'tag-major-aspect'),
    ('tag-aspect', 'tag-conjunct'),
    ('tag-aspect', 'tag-square'),
    ('tag-major-aspect', 'tag-conjunct'),
    ('tag-major-aspect', 'tag-square'),
    ('tag-planet', 'tag-sun'),
    ('tag-planet', 'tag-mercury'),
    ('tag-planet', 'tag-venus'),
    ('tag-planet', 'tag-mars'),
    ('tag-planet', 'tag-saturn'),
    ('tag-sign', 'tag-aries'),
    ('tag-element', 'tag-fire');

insert into calendar_events (id, created_at, updated_at, color, description, "end", latitude, "location", longitude, "start", "summary", timezone) values
    ('event-mercury-retrograde', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', null, 'Mercury appears to move backward through the zodiac', '2026-03-20T19:32:00.000Z', 40.712800, 'New York, NY', -74.006000, '2026-02-26T06:48:00.000Z', 'Mercury Retrograde', 'America/New_York'),
    ('event-mars-conjunct-venus', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', '#b91c1c', 'Mars and Venus meet at the same zodiacal longitude', '2026-03-04T15:20:00.000Z', 40.712800, 'New York, NY', -74.006000, '2026-03-04T15:20:00.000Z', 'Mars Conjunct Venus', 'America/New_York'),
    ('event-sun-ingress-aries', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', null, 'The Sun enters Aries at the vernal equinox', '2026-03-20T14:46:00.000Z', 40.712800, 'New York, NY', -74.006000, '2026-03-20T14:46:00.000Z', 'Sun Ingress Aries', 'America/New_York'),
    ('event-venus-ingress-aries', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', null, 'Venus enters Aries', '2026-03-26T03:12:00.000Z', 40.712800, 'New York, NY', -74.006000, '2026-03-26T03:12:00.000Z', 'Venus Ingress Aries', 'America/New_York'),
    ('event-mars-square-saturn', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', null, 'Mars and Saturn stand ninety degrees apart', '2026-04-10T22:05:00.000Z', 40.712800, 'New York, NY', -74.006000, '2026-04-10T22:05:00.000Z', 'Mars Square Saturn', 'America/New_York'),
    ('event-sun-ingress-cancer', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', null, 'The Sun enters Cancer at the summer solstice', '2026-06-21T08:24:00.000Z', 40.712800, 'New York, NY', -74.006000, '2026-06-21T08:24:00.000Z', 'Sun Ingress Cancer', 'America/New_York');

insert into calendar_event_tags (calendar_event_id, tag_id) values
    ('event-mercury-retrograde', 'tag-retrograde'),
    ('event-mercury-retrograde', 'tag-mercury'),
    ('event-mars-conjunct-venus', 'tag-conjunct'),
    ('event-mars-conjunct-venus', 'tag-mars'),
    ('event-mars-conjunct-venus', 'tag-venus'),
    ('event-sun-ingress-aries', 'tag-ingress'),
    ('event-sun-ingress-aries', 'tag-sun'),
    ('event-sun-ingress-aries', 'tag-aries'),
    ('event-sun-ingress-aries', 'tag-fire'),
    ('event-venus-ingress-aries', 'tag-ingress'),
    ('event-venus-ingress-aries', 'tag-venus'),
    ('event-venus-ingress-aries', 'tag-aries'),
    ('event-venus-ingress-aries', 'tag-fire'),
    ('event-mars-square-saturn', 'tag-square'),
    ('event-mars-square-saturn', 'tag-mars'),
    ('event-mars-square-saturn', 'tag-saturn'),
    ('event-sun-ingress-cancer', 'tag-ingress'),
    ('event-sun-ingress-cancer', 'tag-sun');
