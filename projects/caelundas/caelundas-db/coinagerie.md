<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **ascension**: Right ascension, a star's east-west sky coordinate in hours, stored on the `Star` entity.
- **caelundas**: The astronomical calendar product under projects/caelundas: a CLI that detects sky events from Swiss Ephemeris positions, and the database, API, and web calendar that store and show them.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **cascade**: The `ON DELETE CASCADE` rule on tag and event relations, so deleting a row removes the rows that point at it.
- **codependix**: IC-suite toolchain that exports dependency graphs and enforces boundary rules between projects, modules, and files.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **constellation**: One of the 88 IAU constellations, the `Constellation` entity, with its figure held as `ConstellationLine` rows.
- **coordinate**: A latitude or longitude value, stored as `numeric(9,6)`.
- **declination**: A star's north-south sky coordinate in degrees, stored on the `Star` entity.
- **degree**: The angle unit of declination, as in `declinationDegrees`.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **descendant**: A tag beneath another in the tag tree; the `tags_closure` table holds every ancestor and descendant pair.
- **designation**: A constellation's three-letter IAU abbreviation, such as `UMa`, and its primary key.
- **dow**: Postgres `extract` field for the day of the week, which the derived-time view reads as `start_weekday`.
- **doy**: Postgres `extract` field for the day of the year, which the derived-time view uses to number weeks.
- **epoch**: Postgres `extract` field giving an interval in seconds, from which the derived-time view computes `duration_minutes`.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **hip**: A star's Hipparcos catalog number, the key of the `stars` table and of each constellation line's two ends.
- **latitude**: The observer's north-south position in degrees, part of the natural key of `calendar_events`.
- **longitude**: The observer's east-west position in degrees, part of the natural key of `calendar_events`.
- **magnitude**: A star's apparent visual brightness, where a lower number is brighter, stored on the `Star` entity.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **mod**: The Postgres modulo function, used in the derived-time view to number weeks.
- **planet**: Sample root tag in the integration tests, with body tags such as Mars beneath it.
- **quarter**: The calendar quarter of the year an event starts in, the `start_quarter` column of the derived-time view.
- **refresh**: The Refresh Documentation workflow that regenerates the repository wiki on a schedule, and the reload step after instruction changes.
- **retrograde**: Sample tag and event in the integration tests, standing for a planet's apparent backward motion.
- **sibling**: A tag with the same parent as another; a tag's name must be unique among its siblings.
- **star**: A star of the HYG catalog, the `Star` entity, keyed by its Hipparcos number.
- **temporality**: Derived column classing an event as `Instant` when its start equals its end, and `Duration` otherwise.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **updatable**: The `PostgresqlUpdatableEntity` base from `@codebase/persistence`, which gives `calendar_events` its audit columns.
- **weekday**: The day of the week an event starts on, numbered from Sunday as 0, the `start_weekday` column of the derived-time view.
- **zodiac**: Boolean on a constellation saying whether the ecliptic crosses it as one of the twelve zodiac signs.

<!-- coinagerie:end -->
