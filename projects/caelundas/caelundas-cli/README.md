# 🛰️ Caelundas

**Turn the sky into a calendar.**

Caelundas computes planetary positions minute by minute over a date range,
detects the astronomical events in them — aspects, phases, eclipses,
retrogrades, ingresses, solstices, twilights — and stores them in Postgres,
where the web calendar reads them.

## Quick Start

```bash
# 1. Download the Swiss Ephemeris data files (one-time, about 2 MB)
nx run caelundas-cli:download-ephemeris

# 2. Configure your observer location, date range and database
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env

# 3. Start the local Postgres (docker compose) and create the schema
nx run caelundas-db:migration:run

# 4. Detect the events and store them
nx run caelundas-cli:start

# 5. Ingest the stars and constellation figures the web calendar's night sky
#    draws (see "Night sky" below for the three files it reads)
nx run caelundas-cli:start:night-sky --stars hygdata_v41.csv \
  --constellations constellations.json --lines constellations.lines.json
```

The result lands in the `calendar_events` table.

## Configuration

All input comes from environment variables, validated on startup.

```bash
LATITUDE="39.949309"          # Observer latitude, -90 to 90
LONGITUDE="-75.17169"         # Observer longitude, -180 to 180
START_DATE="2026-07-01"       # YYYY-MM-DD
END_DATE="2026-07-31"         # YYYY-MM-DD
```

Every field is optional. Location defaults to Philadelphia, and the date range
to a two-month window centered on today.

The database is the `caelundas` schema of `caelundas_development`, read through
`CAELUNDAS_POSTGRES_*` only (database, host, password, port, schema and
username, each defaulting to the local Docker Postgres, as `.env.default`
lists). The unprefixed `POSTGRES_*` admin login is never read.

The **timezone is derived from your coordinates** rather than configured
separately — a calendar whose location and timezone could disagree is a
calendar with silently wrong sunrise times. Supported dates run from
`1900-01-01` to `2100-12-31`, the span of the ephemeris data.

## Ephemeris

Positions come from the [Swiss Ephemeris](https://www.astro.com/swisseph/)
(`sweph`), computed locally from JPL DE431 data files — no network calls, no
API keys, no rate limits. The data files are not committed; download them once
with `nx run caelundas-cli:download-ephemeris` into `data/ephemeris/`. Without
them the library quietly falls back to a less precise built-in ephemeris, so a
run stops before it starts if any file is missing, and any calculation the
files did not answer is refused, with an error that names that command.

## Events

Detection runs in two passes.

**Perfective** — the moment something is exact. Ephemerides are computed
day by day and scanned at minute resolution for the instant an aspect
perfects, a planet stations, or a body crosses a sign boundary.

**Progressive** — the span around it. The same domain services turn those exact
moments into the periods a reader actually wants on a calendar: the days an
aspect is in orb, the weeks a planet is retrograde.

| Family              | Events                                                                                                                                                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aspects             | Major (conjunct, opposite, sextile, square, trine), minor, and harmonic aspects between the Sun, Moon, planets, Chiron, Lilith, four asteroids, the north lunar node, and the lunar apogee; exact moments, and the span from forming to dissolving, through both edges of the window                                       |
| Compound aspects    | Triple (grand trine, hammer, T-square, yod), quadruple (boomerang, butterfly, cradle, grand cross, hourglass, kite, mystic rectangle), pentagram, hexagram, and stelliums of three or more bodies, each beginning when the last of its aspects forms and ending when the first dissolves, through both edges of the window |
| Monthly lunar cycle | The eight Moon phases, each as the span until the next                                                                                                                                                                                                                                                                     |
| Planetary phases    | Mercury, Venus, and Mars: rise and set, for Mercury and Venus the greatest elongation and brightest, and for Mars its opposition, with each apparition split into a widening half and a closing half (the brightest instants are the ones stored)                                                                          |
| Eclipses            | Solar and lunar: the span from begin to end, and the maximum                                                                                                                                                                                                                                                               |
| Retrogrades         | The retrograde and direct periods between the stations, through both edges of the window                                                                                                                                                                                                                                   |
| Ingresses           | Each body's stay in a sign, in a decan, and in a half of a sign, through both edges of the window                                                                                                                                                                                                                          |
| Annual solar cycle  | The four seasons, the sixteen pre- and post- intervals between the points of the year (solstices, equinoxes, cross-quarter days, hexadecans), and the Sun's advancing and retreating between perihelion and aphelion                                                                                                       |
| Lunar apsides       | The Moon's advancing and retreating between apogee and perigee, where its radial speed changes sign                                                                                                                                                                                                                        |
| Daily cycles        | Sunrise, sunset, solar zenith and nadir, lunar zenith and nadir, and the span the Moon is up                                                                                                                                                                                                                               |
| Twilights           | The Daylight, twilight, and Night spans, between civil, nautical, and astronomical dawn and dusk                                                                                                                                                                                                                           |

### Which events have a span

A perfective event is an instant: a boundary that starts or ends something, or
a point inside it. A progressive event is the span between a start boundary and
an end boundary. It classifies as `Temporality / Progressive`, and an instant as
`Temporality / Perfective`.

| Span                                             | From                                    | To                                 | Window edges |
| ------------------------------------------------ | --------------------------------------- | ---------------------------------- | ------------ |
| Simple aspect in orb                             | Forming                                 | Dissolving                         | Completed    |
| Compound aspect (triple through stellium)        | Latest forming of its aspects           | Earliest dissolving of its aspects | Completed    |
| Moon phase                                       | A phase                                 | The next phase                     | Completed    |
| Lunar advancing and retreating                   | Apogee or perigee                       | The other                          | Completed    |
| Mercury and Venus morning and evening visibility | Morning or evening rise                 | The matching set                   | Completed    |
| Mercury and Venus widening                       | Rise                                    | Greatest elongation                | Completed    |
| Mercury and Venus closing                        | Greatest elongation                     | Set                                | Completed    |
| Mars widening                                    | Morning rise                            | Opposition                         | Completed    |
| Mars closing                                     | Opposition                              | Evening set                        | Completed    |
| Eclipse, in each frame                           | Begins                                  | Ends                               | Completed    |
| Retrograde period                                | Retrograde station                      | Direct station                     | Completed    |
| Direct period                                    | Direct station                          | Retrograde station                 | Completed    |
| Stay in a sign                                   | A sign ingress                          | The next sign ingress              | Completed    |
| Stay in a decan                                  | A sign or decan ingress                 | The next one                       | Completed    |
| Stay on one side of a sign's peak                | A sign or peak ingress                  | The next one                       | Completed    |
| Season                                           | An equinox or solstice                  | The next one                       | Completed    |
| Pre- and post- interval of the year              | A named point or the hexadecan after it | The next point                     | Completed    |
| Solar advancing and retreating                   | Aphelion or perihelion                  | The other                          | Completed    |
| Twilight, Daylight, and Night                    | Dawn or dusk                            | The next boundary                  | Completed    |
| Moon up                                          | Moonrise                                | Moonset                            | Completed    |

#### Which instants are stored

A run finds every boundary, because it builds and completes the spans from them,
but stores only the instants no span says. An instant that starts or ends a stored
span is left out, since the span has the same minute (`ProgressiveService.withoutSpanBoundaries`,
from the rules in `SPAN_BOUNDARY_RULES`, in `progressive.constants.ts`). The rule
holds only while a span of the instant's family has it on that edge, so an instant
whose span was not stored stays.

| Left out: the instants of                            | Because the span                                             |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Forming and Dissolving, of simple and compound       | Aspect in orb, and each compound aspect                      |
| The eight Moon phases                                | Moon phase                                                   |
| Lunar apogee and perigee                             | Lunar advancing and retreating                               |
| Mercury, Venus, Mars rise and set; the elongations   | Visibility, widening and closing                             |
| Mars opposition                                      | Mars widening and closing                                    |
| Eclipse begin and end                                | Eclipse, in each frame                                       |
| Retrograde and direct stations                       | Retrograde period and direct period                          |
| Sign, decan, and peak ingresses                      | Stay in a sign, a decan, or on a side of the peak            |
| The sixteen points of the year, perihelion, aphelion | Season, interval of the year, solar advancing and retreating |
| Moonrise and moonset                                 | Moon up                                                      |
| Civil, nautical, and astronomical dawn and dusk      | Twilight, Daylight, and Night                                |

These stay, because they last no time and no span starts or ends on them: exact
aspects, eclipse maximum, brightest, solar and lunar zenith and nadir, and sunrise
and sunset.

An upsert does not delete a row a run stops generating, so the instants earlier
runs stored stay until they are pruned. After a run that stores the spans,
[`documentation/prune-span-boundaries.sql`](documentation/prune-span-boundaries.sql)
lists them with a count a family and deletes them on request; see its header for
the commands.

Mars has no greatest elongation, because it reaches 180° from the Sun. Its
apparition runs from its rise in the morning sky, widening from the Sun to
opposition, then closing on it in the evening sky to its set. Opposition is the
minute its longitude gap from the Sun falls through 180°. Mars's rise and set
never pair with each other, since it reaches opposition before it can set into
the Sun's glare, so each half pairs with opposition.

#### Window edges

A run detects only the boundaries inside its window, so a span that began
before the window or ends after it has one boundary missing, and pairing would
drop it. Every row of the table above says Completed: the run finds the missing
boundary and builds the span with its true start or end, even when that lies
outside the window, so two windows that see the same span store the same row.
Each search walks the ephemeris away from the edge a probe at a time, while a
cheap test of the state at each probe holds (the Moon's phase, the Sun's band
of twilight, how far a planet is from the Sun), then bisects the probe step
that held the change down to the minute. It then runs the same detector the
sweep uses on the minutes around that change, so both name the same minute:

- **Aspects**: a quarter-day probe, or a day when both bodies are slow
  (Chiron, Jupiter through Pluto, the north lunar node). It finds the last
  minute the pair is in orb, then asks the aspect detectors for the forming or
  dissolving event they would have given there. An aspect in orb through the
  whole window, such as a slow sextile, gets both: a span from its true
  forming to its true dissolving, however far outside the window they lie.
- **Compound aspects**: no search of their own. The window's simple aspects,
  with the edges just found, are replayed in order, and the compound detectors
  run at each change outside the window. A compound therefore begins at the
  latest forming of its aspects and ends at the earliest dissolving, and the
  sweep no longer stamps one already in orb with the window's start.
- **Retrograde and direct periods**: a day-long probe for the direction to
  change, then a minute-by-minute scan with the station detection. The search
  gives up after 1,100 days. Lilith, the mean apogee, never stations and is not
  among the bodies that retrograde.
- **Stays in a sign, a decan, and on a side of the peak**, **seasons**, and the
  **pre- and post- intervals**: a day-long probe for the slice of the zodiac or
  of the Sun's longitude (30°, 10°, 15°, 90°, 22.5°) to change.
- **Moon phases and lunar apsides**: a six-hour probe for the octant of the
  Moon's elongation, or the sign of its radial speed, to change.
- **Solar apsides**: a day-long probe for the sign of the Sun's radial speed.
- **Twilights, daylight, and night**: a ten-minute probe for the Sun's band
  (below -18°, -18° to -12°, -12° to -6°, above -6°) to change.
- **Moon up**: a half-hour probe for the Moon's upper limb to clear the
  horizon or not.
- **Mercury and Venus**: a twelve-hour probe for the planet to leave or enter
  6° of the Sun, on either side; and for the greatest elongation, the search
  narrows by thirds to where its separation from the Sun peaks between the
  apparition's rise and set.
- **Mars**: the same probe, which also changes at opposition, where the planet
  passes from west of the Sun to east of it; the rise, opposition and set are
  all found by it.
- **Eclipses**: when an eclipse is underway at an edge, the eight hours around
  it are detected again, minute by minute, so its beginning and ending carry
  the type and the minute a window around the whole eclipse would have given.

The searches add about three seconds to a run, whatever its length.

#### Limits

Every span is kept at 1900-01-01 and 2100-12-31. When a search reaches one of
those limits before finding the true boundary, the span is clipped at the
limit's minute (`1900-01-01T00:00Z`, `2100-12-31T23:59Z`), for every family in
the table above, never dropped and never left at the window's edge. The boundary
search does it in one place: where a state of the sky still holds at a limit it
walks on, up to 800 days past it, to name the boundary event, then pulls that
event back to the limit. Aspects, whose orbs can outlast any walk, clip with
the detectors as if the aspect changed at the limit, and the stays and the
retrograde and direct periods, whose kind the state gives, use the limit's
minute directly. A window that reaches past a limit, as one in a timezone ahead
of UTC can, keeps its own edge.

## Conventions

Where astronomy and astrology each have more than one accepted definition,
caelundas picks one. These are the choices, so you can reconcile a caelundas
calendar with another source.

### Moon phases

Every Moon phase is timed by the Moon's apparent geocentric ecliptic longitude
minus the Sun's, E, normalized to [0°, 360°). Positions are Swiss Ephemeris
apparent geocentric values. Illumination is not used:

| Phase           | E    |
| --------------- | ---- |
| New Moon        | 0°   |
| Waxing Crescent | 45°  |
| First Quarter   | 90°  |
| Waxing Gibbous  | 135° |
| Full Moon       | 180° |
| Waning Gibbous  | 225° |
| Last Quarter    | 270° |
| Waning Crescent | 315° |

The four primary phases follow the definition the US Naval Observatory and
the almanacs publish. Each phase is stamped at the whole minute nearest the
crossing, which is how USNO rounds, so primary phases land within two minutes
of its times. The crescent and gibbous phases begin at the octants halfway
between them, so each of the eight phases spans 45° of elongation.
Illumination would put the crescent and gibbous boundaries near 60° and 120°,
not halfway, and its extremes miss New and Full Moon by up to half an hour.

### Lunar points

- **True node.** The north lunar node is Swiss Ephemeris's true (osculating)
  node, not the smoothed mean node. It wobbles by up to about 1.5° around the
  mean node, so it can differ from calendars that use the mean node and
  occasionally turns direct or retrograde on a different day. The south node
  is computed as the opposite point but used in no event, so it appears in no
  aspect or ingress.
- **Lilith and the lunar apogee.** Both are tracked, as separate bodies.
  Lilith is the mean lunar apogee, a smooth average. The lunar apogee is the
  osculating apogee, the instantaneous value, which can stray from the mean by
  tens of degrees. Most astrology software offers one or the other,
  so expect one of the two to match it.

### Stelliums

A stellium is three or more bodies that are all in conjunction with one
another. Conjunction uses the aspect orb, 8°, and every pair must be within
it, not just a chain of neighbors. Detection finds each maximal clique of
pairwise conjunct bodies with three or more members.

### Ingresses

- **Decans** are equal 10° thirds of a sign, numbered 1 to 3 from the sign's
  first degree. Decan 1 begins at the sign boundary, which is the sign
  ingress, so a decan ingress into decan 1 appears only when a body moves
  backward from decan 2.
- **Peak ingress** is the moment a body's longitude within its sign reaches
  15°, the midpoint of the sign, in either forward or retrograde direction.
  A retrograde re-entry across a sign boundary does not fire a peak ingress.
- **Sign transit** is a body's stay in one sign, from its sign ingress to the
  next one, named like `Moon in Taurus`. It carries the ingress, sign, and body
  tags, and classifies as `Zodiac / Ingress / Sign Transit` and `Temporality /
Progressive`, so filtering by body, sign, or progressive finds it. A
  retrograde re-entry starts a new stay in the sign it left. Every body that has
  sign ingresses gets one, so a body is always in a sign.
- **Decan transit** is a body's stay in one decan, named like `Mars in decan 2
Aries`, and **peak transit** its stay in the first or second 15° of a sign,
  before or after the peak, named like `Sun in first half of Aries`. A decan
  transit runs between sign and decan ingresses, a peak transit between sign
  and peak ingresses, and each classifies as `Zodiac / Ingress / Decan Transit`
  or `Peak Transit`, with the decan or `Zodiac / Peak / Before Peak` or `After
Peak` beneath it. Each slice is read from the ephemeris at
  the change, not from the tags, since a retrograde body leaving a sign enters
  its last decan, and the second half, not the first.
- **Window edges.** See Window edges above: the stay in progress at the window
  start and the last stay both get their true entry and exit minute, or the
  limit when that lies beyond it (see Limits).

### Daily cycles

- **Zenith and nadir** are the highest and lowest altitude the body reaches,
  found as local extrema of its altitude each minute. This is not the
  meridian transit the US Naval Observatory lists: the two differ when the
  body's declination changes, and by most for the Moon.
- **Altitude** is the refracted (apparent) altitude from Swiss Ephemeris,
  not the geometric one: the call passes pressure 0, which Swiss Ephemeris
  estimates from the observer's height (sea level here), and 0 °C.
- **Sunrise, sunset, moonrise, and moonset** are times the body crosses the
  horizon with topocentric parallax, the standard upper-limb altitude for the
  Sun (-0.833°), and the Moon's topocentric semidiameter.

### Twilights

Civil, nautical, and astronomical twilight begin and end when the Sun's
refracted altitude (see Daily cycles) crosses -6°, -12°, and -18°. **Daylight**
runs from civil dawn to civil dusk, so it includes the civil twilights and is
longer than sunrise to sunset. **Night** runs from astronomical dusk to
astronomical dawn.

## Stored events

Each run upserts the events it detects into the `calendar_events` table, in the
`caelundas` schema, and refreshes the read model.

| Column                              | Holds                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `name`, `note`                      | The event's title and detail, which detectors build as `summary` and `description`            |
| `start`, `end`                      | `timestamptz`; equal for an instant                                                           |
| `latitude`, `longitude`             | The `numeric` observer location the event was computed for                                    |
| `timezone`                          | The IANA zone derived from that location, such as `America/New_York`, to render local time in |
| `id`, `created_at`, `updated_at`, … | `uuidv7()` id and audit columns                                                               |

An event is unique on `(name, start, end, latitude, longitude)`:

- Re-running a range updates rows in place. `updated_at` advances; `created_at`
  does not.
- An overlapping range updates the overlap and adds only the new events.
- A run for a second location adds rows of its own.
- An event spanning a range edge, like a retrograde, is included in that
  range's files.

An event's tags live in two more tables rather than a column:

| Table                 | Holds                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `tags`                | A graph of labels with many roots, a tag possibly under several parents: a `name`, unique among its siblings                            |
| `tag_edges`           | One `(source_node, target_node)` row per parent and child, generated by `@Graph` on `Tag`                                               |
| `tag_trees`           | A materialized view: one `(ancestor_id, descendant_id)` row per pair over every path of the graph, each tag paired with itself included |
| `calendar_event_tags` | The links between events and tags, keyed on `(calendar_event_id, tag_id)`, with a second index leading with the tag                     |

The upsert classifies each event's raw tags into paths of the tree, inserting
any node that is missing, and replaces the event's links, so a re-run that
drops a tag drops its link. A static map in `src/modules/tags/` turns each raw
tag into one or more paths, implied tags included, and a raw tag the map does
not know falls back to a root of its own. The roots follow the modules of
this project, about ten of them at most, since every filter, group and sort menu opens
on them. A root groups what one module family detects with the attributes that
travel with it, and a tag with several parents is carried as several paths on
the event, not as a node with two parents, so an Aries event carries
`Zodiac / Sign / Aries`, `Zodiac / Element / Fire`, `Zodiac / Modality /
Cardinal` and `Zodiac / Polarity / Positive` side by side:

| Root          | Its nodes                                                                                                                                                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Aspect`      | `Simple` (`Major`, `Minor` and `Specialty`) and `Compound` (`Triple`, `Quadruple`, `Quintuple`, `Sextuple` and `Stellium`) aspects by name, with their `Nature`, `Harmonic` (`Harmonic 1` to `Harmonic 12`), `Phase` (`Forming`, `Exact` and `Dissolving`) and `Focal Body` |
| `Body`        | Every body under its class: `Luminary`, `Planet` (holding `Personal`, `Social` and `Outer`), `Asteroid` or `Point`                                                                                                                                                          |
| `Zodiac`      | `Sign`, `Element`, `Modality`, `Polarity`, `Decan`, a traditional planet's `Dignity` in the sign it enters, and the `Ingress` kinds                                                                                                                                         |
| `Solar`       | The `Annual Cycle` (solstices, equinoxes, cross-quarter days, hexadecans, apsides, and the sixteen `Interval`s) and its `Season`                                                                                                                                            |
| `Lunar`       | The `Monthly Cycle`, with the Moon's phases, and its `Apsides`, with `Advancing` and `Retreating`                                                                                                                                                                           |
| `Daily`       | The `Solar Cycle` and `Lunar Cycle` of a day, each with its `Rise`, `Set`, `Zenith` and `Nadir` (and the Moon's `Moon Up` span), its `Twilight` events and spans, and `Time of Day`                                                                                         |
| `Planetary`   | `Direction` (stations and retrograde periods), `Phase` (`Mercurian`, `Venusian` and `Martian`) and `Synodic Stage` (including `Widening` and `Closing`)                                                                                                                     |
| `Eclipse`     | `Solar` and `Lunar` by type (`Total`, `Partial`, `Annular`), with their `Frame` (`Geocentric` or `Topocentric`) and `Phase`                                                                                                                                                 |
| `Temporality` | `Perfective`, an instant in time, or `Progressive`, progressing over a duration of time                                                                                                                                                                                     |

Mars is full at opposition rather than at a superior conjunction, so its full
and opposition events take an `Opposition` synodic stage of their own; a phase
named like its stage, such as Mars's conjunction, is typed as `Martian
Conjunction`, and a focal body as `Sun Focal`, so no event carries one name
twice.

Each node also has an optional `note`, a sentence saying what it means, and
an `icon`, the slug of a lucide icon, both from `tags/modules/tag-metadata/tag-metadata.constants.ts`,
and a `rank`, its place among its siblings from `tags/modules/tag-metadata/tag-metadata-rank.constants.ts`
(0 when unlisted, sorted first by name). All three are written when a node is
first created.

An event links only to the deepest node of each branch it is classified
under, and carries the nodes above through the tag trees view; a node declared under several parents (`TAG_EXTRA_PARENTS`, such as Venus under Planet / Benefic as well as Planet / Personal, Aries under Fire, Cardinal and Positive as well as Sign, or a square under Hard and Harmonic 4) is one node with an edge from each, so an event carrying it is under every parent.

Coordinates are `numeric(9, 6)`: the driver returns them as strings, such as
`"39.949309"`, and a number is written fixed to six decimals, so the natural key
compares them exactly. `start` and `end` are `timestamptz`, read back in UTC.
Ids are `uuidv7()` values the database assigns, so a run never derives one.

A run adds to the database, and the same event for the same place updates its
row, through `INSERT … ON CONFLICT (name, start, end, latitude, longitude)
DO UPDATE`, so re-running an ingest never duplicates it. Rows go in batches
sized by their columns to stay under Postgres's 65,535 bind parameters per
statement. The entities, the one migration, and the read model come from the
`caelundas-db` library: apply the migration with
`nx run caelundas-db:migration:run` before the first run (`migration:generate`
creates the next one). Every run ends by refreshing the read model
(`calendar_event_tag_sets`, then the `filters` and `calendar_event_facts` the
API queries) with `CaelundasDatabaseService.refreshMetrics`, in the
same transaction that wrote the events, so a failed refresh stores nothing and
there is no separate build step.

Postgres takes concurrent writers, but two runs that insert the same missing
tag at once make the second fail on the tag's unique name; run it again.

## Metrics facts

An ingest refreshes the tag sets and rebuilds the facts the Charts and Totals
layouts read (`calendar_event_facts`, one measure at one filter a row), inside
the same transaction, so nothing else is needed after a run. To refresh them
alone, after editing events or tags by hand:

```bash
nx run caelundas-cli:start:refresh-metrics
```

It refreshes without blocking readers, and logs the time it took (about 4.5
seconds for 50,000 events). The facts, the filters they hang from and the SQL
that reads them are in
[`caelundas-db`'s `metrics-facts.md`](../caelundas-db/documentation/metrics-facts.md).

The `metric-expressions` command, a child module of `refresh-metrics`, draws each
metric's expression tree from the database as a Mermaid flowchart in the marker block of a
Markdown file, with a table of the expressions in infix form. Run it through
`nx run caelundas-db:metric-expressions` (add `:check` to compare without writing), which
writes
[`caelundas-db`'s `metric-expressions.md`](../caelundas-db/documentation/metric-expressions.md).

## Night sky

The `night-sky` command fills the tables the night sky behind `caelundas-web`
is drawn from, `stars`, `constellations` and `constellation_edges`, in the same
database. `caelundas-api` reads them once at startup, so run the command before
starting the API, or restart the API after it. Without it the sky has no stars,
replacing what an earlier run wrote, in one transaction. It reads three files downloaded beforehand, never
committed:

```bash
curl -LO https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv
curl -LO https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.json
curl -LO https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json
nx run caelundas-cli:start:night-sky --stars hygdata_v41.csv \
  --constellations constellations.json --lines constellations.lines.json
```

It stores the stars to magnitude 6.5 at declination -45 degrees or north,
keyed by Hipparcos number, plus any fainter star a figure joins; the 88 IAU
constellations, the twelve of the zodiac flagged (`is_zodiac`); and each figure's segments
between two stored stars. d3-celestial draws its figures by position, so each
vertex is matched to the catalog star within 0.05 degrees of it, and a segment
south of the stored sky is left out.

The stars are the [HYG star database](https://github.com/astronexus/HYG-Database)
v4.1, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), David
Nash and the HYG contributors; the stored catalog is a derived work under the same license. The constellations and figures are
[d3-celestial](https://github.com/ofrohn/d3-celestial)'s, BSD-3-Clause, Olaf
Frohn, after the IAU's constellation charts.

## Structure

```text
src/
├── main.ts                  # CommandFactory bootstrap
├── constants.ts             # Environment schema (Zod)
└── modules/
    ├── caelundas/           # Root command — the pipeline
    ├── input/               # Coordinate and date validation, timezone lookup
    ├── ephemeris/           # Swiss Ephemeris access: positions, horizons, phenomena;
    │                        #   child modules include datetime/, math/, ephemeris-download/
    ├── perfective/          # Exact-moment detection across every event service;
    │                        #   child modules: eclipses/, phases/, retrogrades/, ingresses/,
    │                        #   twilights/, daily-cycles/, annual-solar-cycle/, monthly-lunar-cycle/
    ├── aspects/             # Aspect detection; child modules per aspect family, plus stellium/
    ├── progressive/         # Spans derived from those moments
    ├── night-sky/           # Stars and constellation figures for the web's night sky
    ├── calendar-events/     # Upserting stored calendar events
    ├── tags/                # Resolving raw tag strings to nodes of the tag tree
    └── calendar/            # Building the instant events detectors report
```

## Start

Detect and store the events of the configured location and date range:

```bash
nx run caelundas-cli:start
```

## Test

Integration and end-to-end suites start a throwaway Postgres in a Testcontainers
container and run the real migration against it, so Docker must be running.

```bash
nx run caelundas-cli:vitest
```

```bash
nx run caelundas-cli:vitest:unit          # Fast tests only
nx run caelundas-cli:vitest:end-to-end    # Full pipeline, against a Testcontainers Postgres
nx run caelundas-cli:vitest:integration   # Ingest services, against a Testcontainers Postgres
```

## Development

```bash
nx run caelundas-cli:repl                 # NestJS REPL against the graph
nx run caelundas-cli:typecheck
nx run caelundas-cli:lint-code --configuration=write
```

See [AGENTS.md](AGENTS.md) for the astronomical domain concepts, event
detection algorithms, and testing strategy.

## Etymology

**Caelundas** — a portmanteau of _caelum_ (Latin: sky, heavens) and _calendar_.

## License

MIT — see [LICENSE](../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../../configuration/ic-suite/conformetry-templates/nestjs-command-project) conformetry template.
