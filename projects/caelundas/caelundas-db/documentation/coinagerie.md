<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **ascension**: Right ascension, a star's east-west sky coordinate in hours, stored on the `Star` entity.
- **average**: The mean span length, the `average-duration` metric: the total duration divided by the number of spans.
- **benefic**:
- **constellation**: One of the 88 IAU constellations, the `Constellation` entity, with its figure held as `ConstellationEdge` rows.
- **coordinate**: A latitude or longitude value, stored as `numeric(9,6)`.
- **declination**: A star's north-south sky coordinate in degrees, stored on the `Star` entity.
- **deferrable**:
- **degree**: The angle unit of declination, as in `declinationDegrees`.
- **designation**: A constellation's three-letter IAU abbreviation, such as `UMa`, and its primary key.
- **dimension**:
- **ecb**:
- **estimate**:
- **filetree**: The Mermaid diagram that draws the tag tree as nested, indented entries like a directory listing, chosen with `--diagram filetree` instead of the default flowchart.
- **filterable**:
- **groupable**:
- **hipparco**: Stem of Hipparcos, the star catalog whose numbers are `Star.hipparcosNumber`, the key constellation edges refer to.
- **immutable**:
- **initially**:
- **latitude**: The observer's north-south position in degrees, part of the natural key of `calendar_events`.
- **longitude**: The observer's east-west position in degrees, part of the natural key of `calendar_events`.
- **magnitude**: A star's apparent visual brightness, where a lower number is brighter, stored on the `Star` entity.
- **planet**: Sample root tag in the integration tests, with body tags such as Mars beneath it.
- **plpgsql**:
- **progressive**:
- **retrograde**: Sample tag and event in the integration tests, standing for a planet's apparent backward motion.
- **sky**:
- **smallint**:
- **star**: A star of the HYG catalog, the `Star` entity, keyed by its Hipparcos number.
- **temporality**: Inline expression classing an event as `Instant` when its start equals its end, and `Duration` otherwise.
- **twin**:
- **updatable**: The `PostgresqlUpdatableEntity` base from `@codebase/persistence`, which gives `calendar_events` its audit columns.
- **weekday**: The day of the week an event starts on, numbered from Sunday as 0, taken inline with `extract(dow ...)`.
- **window**:
- **zodiac**: Boolean on a constellation saying whether the ecliptic crosses it as one of the twelve zodiac signs.

<!-- coinagerie:end -->
