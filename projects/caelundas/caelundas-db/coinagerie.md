<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **ascension**: Right ascension, a star's east-west sky coordinate in hours, stored on the `Star` entity.
- **cascade**: The `ON DELETE CASCADE` rule on tag and event relations, so deleting a row removes the rows that point at it.
- **constellation**: One of the 88 IAU constellations, the `Constellation` entity, with its figure held as `ConstellationLine` rows.
- **coordinate**: A latitude or longitude value, stored as `numeric(9,6)`.
- **declination**: A star's north-south sky coordinate in degrees, stored on the `Star` entity.
- **degree**: The angle unit of declination, as in `declinationDegrees`.
- **descendant**: A tag beneath another in the tag tree; the `tags_closure` table holds every ancestor and descendant pair.
- **designation**: A constellation's three-letter IAU abbreviation, such as `UMa`, and its primary key.
- **dow**: Postgres `extract` field for the day of the week, which the derived-time view reads as `start_weekday`.
- **doy**: Postgres `extract` field for the day of the year, which the derived-time view uses to number weeks.
- **epoch**: Postgres `extract` field giving an interval in seconds, from which the derived-time view computes `duration_minutes`.
- **hip**: A star's Hipparcos catalog number, the key of the `stars` table and of each constellation line's two ends.
- **latitude**: The observer's north-south position in degrees, part of the natural key of `calendar_events`.
- **longitude**: The observer's east-west position in degrees, part of the natural key of `calendar_events`.
- **magnitude**: A star's apparent visual brightness, where a lower number is brighter, stored on the `Star` entity.
- **mod**: The Postgres modulo function, used in the derived-time view to number weeks.
- **planet**: Sample root tag in the integration tests, with body tags such as Mars beneath it.
- **quarter**: The calendar quarter of the year an event starts in, the `start_quarter` column of the derived-time view.
- **retrograde**: Sample tag and event in the integration tests, standing for a planet's apparent backward motion.
- **sibling**: A tag with the same parent as another; a tag's name must be unique among its siblings.
- **star**: A star of the HYG catalog, the `Star` entity, keyed by its Hipparcos number.
- **temporality**: Derived column classing an event as `Instant` when its start equals its end, and `Duration` otherwise.
- **updatable**: The `PostgresqlUpdatableEntity` base from `@codebase/persistence`, which gives `calendar_events` its audit columns.
- **weekday**: The day of the week an event starts on, numbered from Sunday as 0, the `start_weekday` column of the derived-time view.
- **zodiac**: Boolean on a constellation saying whether the ecliptic crosses it as one of the twelve zodiac signs.

<!-- coinagerie:end -->
