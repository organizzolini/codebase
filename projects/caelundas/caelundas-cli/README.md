# 🛰️ Caelundas

**Turn the sky into a calendar.**

Caelundas computes planetary positions minute by minute over a date range,
detects the astronomical events in them — aspects, phases, eclipses,
retrogrades, ingresses, solstices, twilights — stores them in Postgres, and
renders an iCalendar file you can subscribe to in Google Calendar, Apple
Calendar, or anything else that reads `.ics`, plus a JSON file of the same
events.

## Quick Start

```bash
# 1. Download the Swiss Ephemeris data files (one-time, about 2 MB)
nx run caelundas-cli:download-ephemeris

# 2. Configure your observer location, date range and database
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env

# 3. Start the local Postgres (docker compose) and create the schema
nx run caelundas-db:migration:run

# 4. Generate the calendar and store its events
nx run caelundas-cli:start

# 5. Ingest the stars and constellation figures the web calendar's night sky
#    draws (see "Night sky" below for the three files it reads)
nx run caelundas-cli:start:night-sky --stars hygdata_v41.csv \
  --constellations constellations.json --lines constellations.lines.json
```

The result lands in `output/caelundas_<start>_<end>.ics`, with a `.json` file
beside it. Import the calendar, or point a subscription at it.

## Configuration

All input comes from environment variables, validated on startup.

```bash
LATITUDE="39.949309"          # Observer latitude, -90 to 90
LONGITUDE="-75.17169"         # Observer longitude, -180 to 180
START_DATE="2026-07-01"       # YYYY-MM-DD
END_DATE="2026-07-31"         # YYYY-MM-DD
OUTPUT_DIRECTORY="./output"
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

| Family | Events |
| ------ | ------ |
| Aspects | Major (conjunct, opposite, sextile, square, trine), minor, and harmonic aspects between the Sun, Moon, planets, Chiron, Lilith, four asteroids, the north lunar node, and the lunar apogee; forming, exact, and dissolving moments, and the span between them |
| Compound aspects | Triple (grand trine, hammer, T-square, yod), quadruple (boomerang, butterfly, cradle, grand cross, hourglass, kite, mystic rectangle), pentagram, hexagram, and stelliums of four or more bodies |
| Monthly lunar cycle | The eight Moon phases, each as an instant and as the span until the next |
| Planetary phases | Mercury, Venus, and Mars: conjunctions, Mars's opposition, the greatest elongations of Mercury and Venus, brightest, rise and set, and morning- and evening-star visibility spans |
| Eclipses | Solar and lunar: begin, maximum, and end |
| Retrogrades | Stations and retrograde periods |
| Ingresses | Sign, decan, and peak ingresses, and the span in each sign |
| Annual solar cycle | Solstices, equinoxes, cross-quarter days, hexadecans, perihelion and aphelion |
| Lunar apsides | Lunar apogee and perigee, where the Moon's radial speed changes sign |
| Daily cycles | Sunrise, sunset, solar zenith and nadir, moonrise, moonset, lunar zenith and nadir |
| Twilights | Civil, nautical, and astronomical dawn and dusk, with the Daylight, twilight, and Night spans |

## Conventions

Where astronomy and astrology each have more than one accepted definition,
caelundas picks one. These are the choices, so you can reconcile a caelundas
calendar with another source.

### Moon phases

Every Moon phase is timed by the Moon's apparent geocentric ecliptic longitude
minus the Sun's, E, normalized to [0°, 360°). Positions are Swiss Ephemeris
apparent geocentric values. Illumination is not used:

| Phase | E |
| ----- | - |
| New Moon | 0° |
| Waxing Crescent | 45° |
| First Quarter | 90° |
| Waxing Gibbous | 135° |
| Full Moon | 180° |
| Waning Gibbous | 225° |
| Last Quarter | 270° |
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

A stellium is four or more bodies that are all in conjunction with one
another. Conjunction uses the aspect orb, 8°, and every pair must be within
it, not just a chain of neighbors. Detection finds each maximal clique of
pairwise conjunct bodies with four or more members.

### Ingresses

- **Decans** are equal 10° thirds of a sign, numbered 1 to 3 from the sign's
  first degree. Decan 1 begins at the sign boundary, which is the sign
  ingress, so a decan ingress into decan 1 appears only when a body moves
  backward from decan 2.
- **Peak ingress** is the moment a body's longitude within its sign reaches
  15°, the midpoint of the sign, in either forward or retrograde direction.
  A retrograde re-entry across a sign boundary does not fire a peak ingress.

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
`caelundas` schema, then queries the table back for the requested range and
location and renders the `.ics` and JSON files from those rows, so the files and
the database never disagree.

| Column | Holds |
| ------ | ----- |
| `summary`, `description` | The event's title and detail |
| `start`, `end` | `timestamptz`; equal for an instant |
| `color`, `location` | Nullable display hints |
| `latitude`, `longitude` | The `numeric` observer location the event was computed for |
| `timezone` | The IANA zone derived from that location, such as `America/New_York`, to render local time in |
| `id`, `created_at`, `updated_at`, … | `uuidv7()` id and audit columns |

An event is unique on `(summary, start, end, latitude, longitude)`:

- Re-running a range updates rows in place. `updated_at` advances; `created_at`
  does not.
- An overlapping range updates the overlap and adds only the new events.
- A run for a second location adds rows of its own.
- An event spanning a range edge, like a retrograde, is included in that
  range's files.

An event's tags live in two more tables rather than a column:

| Table | Holds |
| ----- | ----- |
| `tags` | A tree of labels with many roots: a `name`, unique among its siblings, and a nullable `parent_id` |
| `tags_closure` | One `(ancestor_id, descendant_id)` row per pair in the tree, each tag paired with itself included, so ancestors, descendants, and depth are plain joins |
| `calendar_event_tags` | The links between events and tags, keyed on `(calendar_event_id, tag_id)`, with a second index leading with the tag |

The upsert classifies each event's raw tags into paths of the tree, inserting
any node that is missing, and replaces the event's links, so a re-run that
drops a tag drops its link. A static map in `src/modules/tags/` turns each raw
tag into one or more paths, implied tags included, and a raw tag the map does
not know falls back to a root of its own. Each root is one dimension, and
independent dimensions are never nested, so an Aries event carries `Aries`,
`Fire`, `Cardinal` and `Positive` side by side:

| Root | Its nodes |
| ---- | --------- |
| `Type` | `Aspect` (simple and compound, by class and name), `Ingress`, `Eclipse`, `Station`, `Retrograde Period`, `Twilight`, `Cycle` and `Planetary Phase` (`Venusian`, `Mercurian`, `Martian`) |
| `Planet`, `Body Class` | Every body, and its class: `Luminary`, `Personal`, `Social`, `Outer`, `Asteroid`, `Node` or `Point` |
| `Sign`, `Element`, `Modality`, `Polarity`, `Decan` | A sign and what it implies, and the decan a decan ingress enters |
| `Aspect Nature`, `Aspect Harmonic` | `Hard`, `Soft` or `Neutral`, and `Harmonic 1` to `Harmonic 12` |
| `Phase`, `Lunar Phase`, `Synodic Stage` | Forming to dissolving and eclipse beginning to ending, the Moon's phases, and the stages of the Mercury, Venus and Mars cycles |
| `Motion`, `Temporality`, `Season`, `Domain`, `Dignity` | Retrograde and stations, `Instant` or `Duration`, the season of a solar cycle point, `Solar`, `Lunar` or `Planetary`, and a traditional planet's dignity in the sign it enters |
| `Focal Body`, `Eclipse Frame`, `Time of Day` | The focus of a compound aspect, an eclipse seen geocentrically or from the observer, and a twilight's morning or evening |

The last three roots go beyond the dimensions the spec lists. Their raw tags
tell events apart in ways no listed dimension holds, and filing them under
one would nest an independent attribute. Mars is full at opposition rather
than at a superior conjunction, so its full and opposition events take an
`Opposition` synodic stage of their own; a phase named like its stage, such
as Mars's conjunction, is typed as `Martian Conjunction` so no event carries
one name twice.

An event links only to the deepest node of each branch it is classified
under, and carries the nodes above through the closure table. The `.ics`
output keeps the `CATEGORIES` property, and the JSON output a `tags` array,
both holding the linked tags' names.

Coordinates are `numeric(9, 6)`: the driver returns them as strings, such as
`"39.949309"`, and a number is written fixed to six decimals, so the natural key
compares them exactly. `start` and `end` are `timestamptz`, read back in UTC.
Ids are `uuidv7()` values the database assigns, so a run never derives one.

A run adds to the database, and the same event for the same place updates its
row, through `INSERT … ON CONFLICT (summary, start, end, latitude, longitude)
DO UPDATE`, so re-running an ingest never duplicates it. Rows go in batches
sized by their columns to stay under Postgres's 65,535 bind parameters per
statement. The entities, the one migration, and the read model come from the
`caelundas-db` library: apply the migration with
`nx run caelundas-db:migration:run` before the first run (`migration:generate`
creates the next one). Every run ends by rebuilding the read model
(`tag_nodes`, `calendar_event_tag_nodes`, and the `calendar_event_derived_times`
view the API queries) with `CaelundasDatabaseService.refreshReadModel`, in the
same transaction that wrote the events, so a failed refresh stores nothing and
there is no separate build step.

Postgres takes concurrent writers, but two runs that insert the same missing
tag at once make the second fail on the tag's unique name; run it again.

## Night sky

The `night-sky` command fills the tables the night sky behind `caelundas-web`
is drawn from, `stars`, `constellations` and `constellation_lines`, in the same
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
constellations, the twelve of the zodiac flagged; and each figure's segments
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
    ├── ephemeris/           # Swiss Ephemeris access: positions, horizons, phenomena
    ├── perfective/          # Exact-moment detection across every event service
    ├── progressive/         # Spans derived from those moments
    ├── night-sky/           # Stars and constellation figures for the web's night sky
    ├── calendar-events/     # Upserting and range queries over stored calendar events
    ├── tags/                # Resolving raw tag strings to nodes of the tag tree
    ├── calendar/            # iCalendar and JSON rendering and output
    ├── datetime/, math/     # Time stepping and angular arithmetic
    └── aspects/, phases/, eclipses/, retrogrades/, ingresses/,
        annual-solar-cycle/, monthly-lunar-cycle/, daily-cycles/,
        twilights/, stellium/, …   # One service per event family
```

## Start

Generate a calendar from the configured location and date range:

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

This project was generated from the [nestjs-command-project](../../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run caelundas-cli:coinagerie-check:write`.

- **aggregation**: The ephemeris pipeline stage that merges per-minute body positions into one series, run by EphemerisAggregationService.
- **air**: Element name in the tag dimensions, under which signs such as Aquarius, Gemini, and Libra are grouped for classification.
- **airless**: Horizon elevation mode with no atmospheric refraction, used once in integration tests to check moonrise against USNO times.
- **altitude**: The refracted apparent elevation of a body above the horizon, as Swiss Ephemeris reports it, for rise, set and zenith events.
- **angle**: A degree value in ephemeris and aspect calculations, normalized to the range zero to 360 before bodies are compared.
- **angular**: Adjective for the separation between two bodies in ecliptic longitude, checked against an aspect's orb in degrees.
- **annual**: Yearly solar-cycle group in the annual-solar-cycle module, covering solstices, equinoxes, cross-quarter days, and perihelion and aphelion.
- **annular**: Eclipse phase of a solar eclipse in which the Moon is too distant to cover the Sun, leaving a bright ring.
- **antisolar**: The point opposite the Sun, through which the axis of Earth's shadow passes in the eclipse geometry service.
- **ap**: Stray two-letter fragment with no project meaning; it appears only as a glossary headword and in no caelundas code.
- **apex**: The single body at the vertex of a yod or T-square pattern, which the triple-aspects composer treats as the focal point.
- **aphelion**: The point where Earth is farthest from the Sun, one of the annual solar cycle events the module builds as a calendar entry.
- **apogee**: The farthest point of the Moon's orbit from Earth, tracked as a lunar apsis and built into apogee and perigee calendar events.
- **apside**: Extreme point of a body's orbit, mapped in the ephemeris constants to its Swiss Ephemeris integer for the node or apogee.
- **aquarius**: Zodiac sign name used as a sign key in ingress events, and as the Aqr constellation row in the night-sky seed data.
- **ascension**: Right ascension of a star, stored on the star entity in hours and used to place stars when the night sky is drawn.
- **aspect**: A fixed angular relationship between two bodies, such as conjunct or trine, detected by the aspects module and stored as calendar events.
- **asteroid**: One of the four tracked asteroids, such as Ceres or Juno, included as bodies in aspect and ephemeris calculations.
- **astronomical**: The celestial-event domain of the project, and the twilight kind for dawn and dusk, alongside civil and nautical.
- **autumn**: Fall window of the annual solar cycle, collecting its autumn-season events for each year the detector finds.
- **autumnal**: The autumnal equinox event, built by the annual solar cycle events service with the title Autumnal Equinox.
- **azalt**: Swiss Ephemeris azalt function that converts ecliptic positions to azimuth and altitude in the horizon ephemeris service.
- **azimuth**: Compass bearing of a body along the horizon, one of the horizon ephemeris fields the calendar can carry.
- **band**: Latitude band index used by the night-sky projection code to bin star vertices and find their neighbors.
- **batch**: A group of calendar event rows or migration steps processed together in one pass by the persistence layer.
- **beltane**: The Beltane cross-quarter event, built by the annual solar cycle service on the day between the spring equinox and solstice.
- **biquintile**: Harmonic aspect of 144 degrees, defined in the caelundas constants and detected by the specialty aspects service.
- **boomerang**: Quadruple compound pattern mapped to a returning-arrow glyph in the symbol constants, one of the compound shapes detected.
- **boundary**: An edge of an interval or range, such as a sign, a twilight, or a date-range limit checked by input validation.
- **breadth**: One of the two callidescope limits, measuring how many callees a function fans out to, as the README's Limits table records.
- **brightness**: Apparent magnitude of a planet, used in phase calculations, and the weight of a symbol that grows with the planets involved.
- **brilliancy**: Greatest brilliancy, the magnitude minimum of a planet, which the phase calculation service detects for Venus and Mars.
- **butterfly**: Quadruple compound pattern mapped to a butterfly glyph in the symbol constants, one of the compound shapes detected.
- **cancer**: Zodiac sign Cancer, used as a sign name in ingress seed rows such as event-sun-ingress-cancer.
- **canonical**: The fixed key order for a body pair, so an aspect key is the same regardless of which body comes first.
- **capricorn**: Zodiac sign Capricorn, the sign name the ingresses service returns for longitude 270 degrees in the end-to-end test.
- **chiron**: The body Chiron, tracked alongside the planets in aspects and listed in the caelundas body constants.
- **civil**: First of three twilight kinds, with nautical and astronomical, that the twilight module emits to mark dawn and dusk.
- **conjunct**: Aspect of zero degrees between two bodies, the first of the major aspects and the conjunct tag in the seed data.
- **conjunction**: The zero-degree alignment of two bodies, the aspect that every pair in a stellium must satisfy within the orb.
- **constellation**: A star-chart region stored in the constellation table with its designation and zodiac, loaded by the night-sky command.
- **coordinate**: A longitude, latitude, or azimuth pair for a body or observer, validated as the LATITUDE and LONGITUDE inputs.
- **cradle**: Quadruple compound pattern mapped to a bed glyph in the symbol constants, one of the compound shapes the composer detects.
- **crescent**: Moon phase span of 45 degrees of elongation from new Moon toward first quarter, one of the eight phases the caelundas times.
- **culmination**: The moment a body reaches its highest altitude in the sky, used for lunar zenith events and the rise and set detection.
- **danjon**: Limit named for Danjon in eclipse geometry comments, the angular threshold where the Moon's limb touches the shadow boundary.
- **dawn**: The twilight moment when the Sun rises through a depression angle, opening civil, nautical, or astronomical morning light.
- **daylight**: Span from civil dawn to civil dusk, treated as a separate interval in the twilight events alongside Night.
- **db**:
- **decan**: One of three 10-degree thirds of a zodiac sign, numbered 1 to 3, whose ingresses the ingresses module detects.
- **decile**: Harmonic aspect at 36 degrees, one tenth of a full circle, drawn with a perpendicular symbol.
- **declination**: Angle north or south of the celestial equator, used as the star catalog's dec coordinate in night-sky figures.
- **decuple**: Stellium of ten bodies in conjunction, labeled decuple stellium and drawn with its own symbol in calendar events.
- **degree**: Angular unit of ecliptic longitude, in which signs span 30 degrees, decans 10, and every orb and threshold is set.
- **descendant**: A tag below another in its dimension tree, linked to its ancestors through the tags_closure table for classification queries.
- **designation**: IAU abbreviation such as UMa that identifies a constellation, keyed as the constellation table's primary identifier.
- **dignity**: A planet's standing in a sign, such as domicile, exaltation, or peregrine, which tag-dimensions uses to rank sign ingress tags.
- **dimension**: One root of the tag tree, grouping related tags such as Motion or Season, so each event carries one tag per root.
- **disc**: Apparent circular face of the Sun or Moon as seen from the observer, whose radius decides eclipse overlap geometry.
- **domain**: Feature-level grouping of services under src/modules, such as ephemeris, calendar, or tags, that each own one job.
- **dubhe**: Alpha Ursae Majoris, a bright catalog star that night-sky unit tests use as a fixture.
- **duodecuple**: Stellium of twelve bodies in conjunction, labeled duodecuple stellium and assigned its own symbol in the stellium constants.
- **dusk**: Evening twilight moment when the Sun sinks through a depression angle, closing civil, nautical, or astronomical evening light.
- **early**:
- **earth**: Home planet of the observer, whose orbit sets perihelion and aphelion and whose shadow causes lunar eclipses.
- **eclipse**: Obscuration of the Sun or Moon by Earth's or the Moon's shadow, detected as begin, maximum, and end moments.
- **ecliptic**: Plane of Earth's orbit against which every body's longitude and latitude are measured, the zodiac's reference frame.
- **element**: One of the Fire, Earth, Air, and Water classes of a zodiac sign, a root tag node in the tag tree.
- **elevation**: Altitude of a body above the observer's horizon in degrees, the value that sets sunrise, twilight, and daily cycle thresholds.
- **elongation**: Angle between a planet and the Sun as seen from Earth, measured signed or unsigned, timing Mercury and Venus greatest elongations.
- **ephemeris**: Table of computed body positions over time, produced locally by Swiss Ephemeris from JPL DE431 data files.
- **epimethian**: Name for a superior-side planetary conjunction in the Mercury and Venus stage list, paired with the promethian conjunction.
- **equatorial**: Coordinate system measured from the celestial equator, and Earth's equatorial radius in eclipse geometry.
- **equinox**: Moment the Sun crosses the celestial equator in spring or autumn, one of the annual solar cycle's marked events.
- **estimate**: Provisional eclipse type assigned to an eclipse when it first appears, replaced by a settled type later.
- **family**: Group of related events, such as Aspects, Eclipses, or Twilights, that a README table and service folder share.
- **fire**: Element tag for the fire signs Aries, Leo, and Sagittarius, a root tag node that ingress tags link to.
- **focal**: Body at the apex or focus of a compound aspect pattern, such as the Venus focal body in a kite, named in event summaries.
- **gamma**: Closest approach of the shadow axis to Earth's center, in Earth radii, that classifies an eclipse as partial, central, or total.
- **gap**: Difference between two longitudes or times, such as the separation that closes through an aspect's orb threshold.
- **gemini**: Zodiac sign spanning 60 to 90 degrees of ecliptic longitude, the Gemini tag used in ingress detection and symbols.
- **geocentric**: Viewed from Earth's center rather than the observer's surface, the frame used for Moon phase and lunar eclipse timing.
- **geocentrically**: Adverb form of geocentric, describing a lunar eclipse type judged from Earth's center rather than the observer.
- **gibbous**: Moon phase between half and full, spanning 135 and 225 degrees of elongation, with waxing and waning forms.
- **grand**: Prefix naming large compound patterns like trine, cross, or sextile, built from several aspects in balanced figures.
- **hammer**: Compound aspect pattern built on sesquiquadrate aspects, one of the triple patterns counted in calendar tags.
- **harmonic**: Aspect defined by a multiple of the 360-degree circle, such as the 5th or 12th harmonic, beyond the classic major aspects.
- **hexadecan**: One of sixteen equal solar longitude thresholds in the annual solar cycle, each producing its own named calendar event.
- **hexagon**: Six-body compound pattern of six trines and six sextiles, detected as a valid arrangement of sextuple aspects.
- **hexagram**: Six-body Star of David pattern, drawn from two interlocked triangles, that the sextuple-aspects service validates.
- **hip**: Integer key identifying each star in the star table and night-sky catalog, drawn from the Hipparcos star survey.
- **hor**: Constellation abbreviation for Horologium in the night-sky seed data, one of its non-zodiac constellations.
- **horizon**: The observer's visible boundary of sky, where altitude zero sits, used to define rise, set, and twilight thresholds.
- **horizontal**: Coordinate frame of azimuth and elevation measured from the observer's horizon, the frame Sun and Moon altitudes are reported in.
- **hourglass**: Quadruple compound pattern formed from squares and oppositions, its symbol an hourglass shape in tag tables.
- **illumination**: Fraction of a body's disc that is lit, computed as an ephemeris series but deliberately not used to time Moon phases.
- **imbolc**: Celtic cross-quarter day in the annual solar cycle, placed between the winter solstice and the spring equinox.
- **inferior**: Conjunction of an inner planet between Earth and the Sun, used for Mercury and Venus phase and conjunction events.
- **ingest**: Load the star catalog and constellation figures into the database through the night-sky command.
- **ingress**: Moment a body crosses a sign, decan, or 15-degree midpoint boundary, the event the ingresses module detects.
- **instant**: Moment with equal start and end, such as a single-minute event, stored as the same timestamp in both columns.
- **jd**: Julian Day number, the continuous day count from the utc_to_jd function that Swiss Ephemeris uses for time.
- **jpl**: NASA Jet Propulsion Laboratory, whose DE431 planetary ephemeris data files and Horizons service supply reference positions.
- **julian**: Continuous day count that Swiss Ephemeris time conversions turn UTC moments into, as a Julian Day number.
- **juno**: Minor planet numbered 3, one of four asteroids tracked for aspects and ephemeris positions alongside Ceres, Pallas, and Vesta.
- **jupiter**: Fifth planet from the Sun, the largest body in the ephemeris, tracked for aspects, retrogrades, and ingresses like the others.
- **kite**: Quadruple aspect pattern: a grand trine with a fourth body opposite one trine body, named in calendar event summaries.
- **lamma**: Stemmed form of the August cross-quarter day in the annual solar cycle, used by the Lammas event builder.
- **latitude**: Angle north or south of the reference plane in degrees, also the observer's LATITUDE setting from -90 to 90.
- **leaf**: Terminal tag node with no children in a dimension tree, the most specific label an event is filed under in the tags table.
- **leo**: Zodiac sign and constellation named Leo, one of the twelve signs an event can be tagged with.
- **libra**: Zodiac sign mapped to its own symbol in the caelundas symbol table and listed as a constellation in the night-sky seed.
- **lilith**: Lunar body tracked as the mean lunar apogee, a smooth average that sits alongside the osculating lunar apogee.
- **limb**: Outer edge of the Sun or Moon's disc, whose upper edge sets the daily-cycle sunrise, sunset, moonrise and moonset times.
- **longitude**: Angle in degrees placing a body along the ecliptic, and the observer east-west coordinate set by LONGITUDE.
- **lunar**: Relating to the Moon, covering its phases, nodes, apogee and perigee, daily rise and set, and eclipse events.
- **mag**: Column of the night-sky star catalog holding a star's brightness on the astronomical magnitude scale.
- **magnitude**: Brightness of a body on the astronomical scale, estimated by the phenomena service and listed in the night-sky star catalog.
- **martian**: Group label in the caelundas constants for the Mars phase events, such as its conjunctions and opposition.
- **merak**: Star in the Big Dipper, used as a sample catalog row in the night-sky service unit tests.
- **mercurian**: Group label for Mercury's phase events in the caelundas constants and types, such as its elongations.
- **mercury**: Planet body tracked for stations, conjunctions, and elongations, with a Mercury tag in the events seed data.
- **modality**: Each sign's modality, cardinal, fixed, or mutable, which an event in that sign also carries as a tag.
- **moon**: Earth's natural satellite, the body whose phases, rise and set, and apsides this calendar detects.
- **moonrise**: Daily-cycle event for the instant the Moon's upper limb appears above the horizon, detected for each day.
- **moonset**: Daily-cycle event for the instant the Moon's upper limb dips below the horizon, detected for each day.
- **mystic**: Compound aspect of two oppositions joined by four sextiles, called a mystic rectangle in the aspect types.
- **nadir**: Lowest altitude a body reaches each day, timed as the lunar or solar nadir daily-cycle event.
- **nautical**: Twilight stage between civil and astronomical, detected as dawn and dusk boundary events for each day.
- **neptune**: Outer planet in the caelundas body list, tracked for aspects, ingresses, and stellium detection.
- **nonuple**: Stellium of nine mutually conjunct bodies, named in the stellium constants and mapped to a symbol.
- **north**: Osculating lunar node where the Moon's orbit crosses the ecliptic northward, tracked as a body in aspects.
- **novile**: Harmonic aspect at 40 degrees, a ninth-harmonic angle with a tight 1 degree orb in the specialty aspect table.
- **observer**: Location from which positions and rises are computed, set by the LATITUDE and LONGITUDE environment variables.
- **octuple**: Compound stellium of eight mutually conjunct bodies, named octuple stellium in the stellium constants.
- **opposition**: Event when a planet sits 180 degrees from the Sun, such as Mars's opposition in the planetary phase events.
- **orb**: Tolerance in degrees around an exact aspect angle within which a body pair counts as in aspect.
- **orbital**: Describes Earth's position and speed around the Sun, which drive annual solar cycle events such as apsis timing.
- **osculate**: Verb describing an orbit's instantaneous values, which the lunar apogee follows rather than the mean apogee.
- **palla**: Asteroid in the caelundas body list, one of four asteroids tracked for aspects and ingresses.
- **parallax**: Shift in a body's apparent position from the observer's surface, used in daily-cycle and eclipse topocentric timing.
- **pentagram**: Compound aspect of five bodies forming a five-pointed star configuration, shown with a star emoji.
- **penumbral**: Eclipse type in which the Moon crosses only Earth's penumbra, with no umbral contact at all.
- **perigee**: Point on the Moon's orbit nearest Earth, where its radial speed changes sign, detected as a lunar apsis.
- **perihelion**: Solar apsis event at Earth's closest approach to the Sun, built by the annual solar cycle events service.
- **phase**: Stage of a body's cycle relative to the Sun, covering Moon phases and planetary phase events in this calendar.
- **phenomenon**: Singular form of phenomena, the ephemeris service group that computes illumination, magnitude, and horizon events.
- **pipeline**: Ordered sequence of stages the caelundas command runs, from input parsing through to calendar output.
- **pisce**: Zodiac sign spanning 330 to 360 degrees of longitude, named in the night-sky seed as Psc.
- **place**: Plain word for a location, where each stored calendar event is keyed by its latitude and longitude.
- **planet**: Tag category grouping the Sun, Mercury, and other bodies, named Planet in the events seed data.
- **planetary**: Describes phase and direction events of the non-luminary planets, such as Mercury's conjunctions or Mars's opposition.
- **pluto**: Dwarf planet in the caelundas body list, tracked for aspects, ingresses, and stellium detection.
- **polarity**: Positive or negative classification of each element, with fire and air signs positive and earth and water negative.
- **prograde**: Direction of a body moving eastward against the stars, tagged with a prograde symbol in the caelundas constants.
- **progressive**: Second detection pass that turns exact moments into the spans around them, such as days in orb or weeks retrograde.
- **promethian**: Mercury's morning conjunction in the Hellenistic tradition, mapped to a new-moon symbol and a conjunction symbol.
- **quadruple**: Compound aspect of four bodies, forming shapes such as boomerang, cradle, butterfly, or grand cross.
- **quarter**: Moon phase at 90 or 270 degrees of elongation from the Sun, the first and last quarter phases.
- **quincunx**: Aspect of 150 degrees between two bodies, listed with the semi-sextile and semi-square in the caelundas constants.
- **quintile**: Aspect of 72 degrees, a fifth-harmonic angle listed in the caelundas aspect angle table.
- **quintuple**: Compound aspect of five bodies, detected by the quintuple aspect composer from sets of pairwise aspects.
- **ra**: Right ascension column in the night-sky star catalog, the equatorial coordinate that positions each star.
- **radial**: Describes motion along the line from Earth to a body, whose sign change marks each lunar or solar apsis.
- **radius**: Apparent angular size of the Sun or Moon's disc, which the daily-cycle timing accounts for at rise and set.
- **rebuild**:
- **rectangle**: Compound configuration formed by two oppositions joined by four sextiles, named in the aspect constants.
- **refraction**: Atmospheric bending of light near the horizon, a 34 arcminute correction applied to rise and set times.
- **retrograde**: Apparent backward motion of a planet across the sky, detected as stations and the periods between them.
- **rise**: Daily-cycle event when a body's upper limb crosses above the horizon, the counterpart to set.
- **sagittarius**: Zodiac sign and constellation spanning 240 to 270 degrees of longitude, listed as Sgr in the night-sky seed.
- **samhain**: Celtic cross-quarter day falling near November 1, built by the annual solar cycle events service.
- **saturn**: A body in the caelundas list, a slow outer planet whose positions, stations, and aspects come from the ephemeris.
- **scenario**: Hand-built ephemeris fixture that unit tests install through setScenarioEphemeris to drive a detector without Swiss Ephemeris data.
- **scorpio**: The eighth zodiac sign, spanning 210 to 240 degrees of longitude, mapped to the Water element and its symbol.
- **season**: Tag dimension naming the solar-cycle season an event falls in, such as spring, summer, autumn, or winter, in the tag tree.
- **semidiameter**: Angular radius of the Sun or Moon disc, added to the horizon altitude when daily cycles compute rise, set, and upper-limb times.
- **semisextile**: Minor aspect at exactly 30 degrees of separation between two bodies, detected by the minor-aspects module.
- **semisquare**: Minor aspect at exactly 45 degrees of separation between two bodies, one of the minor aspect types the minor-aspects module detects.
- **separation**: Angular distance between two bodies, the value aspect detection compares against each aspect's exact angle and its orb.
- **septile**: Specialty aspect at about 51.43 degrees, one seventh of a circle, detected by the specialty-aspects module.
- **septuple**: Compound pattern of seven bodies in conjunction, labelled a septuple stellium in the stellium constants.
- **sesquiquadrate**: Minor aspect at exactly 135 degrees between two bodies, grouped with quincunx and the semi-aspects as a minor aspect type.
- **sextile**: Major aspect at 60 degrees of separation, one of the five major aspects alongside conjunct, opposite, square, and trine.
- **sextuple**: Compound pattern of six bodies, such as a hexagram, that the sextuple-aspects module detects from its hexagon arrangement.
- **shadow**: Umbra or penumbra cone that Earth or the Moon casts, whose geometry decides eclipse type and the totality of each eclipse.
- **sky**: The night-sky module's catalog of stars, constellations, and figure lines, and the command that renders that stored sky.
- **solar**: Relating to the Sun, naming the solar eclipse kind, the annual solar cycle module, and the solar events of daily cycles.
- **solstice**: One of the two annual points where the Sun reaches its extreme declination, emitted as summer and winter solstice events by the annual-solar-cycle module.
- **south**: The south lunar node, opposite the north node, computed but used in no event; also the south part of the stored night sky.
- **spring**: Season of the annual solar cycle from the vernal equinox to the summer solstice, tagged on events such as Beltane.
- **square**: Major aspect at exactly 90 degrees of separation, one of the five major aspects and the base of T-square patterns.
- **star**: Catalog star from the Hipparcos-keyed table, placed as a vertex of constellation figure lines by the night-sky module.
- **station**: Stationary point where a planet's longitude speed passes zero, recorded as morning or evening station events by the retrogrades module.
- **stellium**: Group of four or more bodies that are all in conjunction within the 8 degree orb, detected as maximal cliques by the stellium module.
- **subtend**: Function that returns the angle a body of given radius subtends at a distance, used for parallax and semidiameter in eclipse test utilities.
- **summer**: Season of the annual solar cycle from the summer solstice to the autumnal equinox, tagged on solstice and related events.
- **sun**: The Sun body, the subject of solar events, and the reference body for twilight, sunrise, sunset, and eclipse geometry.
- **sunrise**: Daily-cycle event where the Sun's upper limb crosses the horizon at minus 0.8333 degrees, computed by the daily-cycles module.
- **sunset**: Daily-cycle event where the Sun's upper limb dips below the horizon, the counterpart of sunrise in the daily-cycles module.
- **superior**: Qualifier for a conjunction where a planet passes behind the Sun, as in the superior conjunction that Venusian phase detection tracks.
- **swiss**: Short for Swiss Ephemeris, the sweph library and its data files that compute every body position locally without network calls.
- **synodic**: Adjective for the cycle of a planet's conjunctions with the Sun, which the phase model uses for Mercury, Venus, and Mars stages.
- **taurus**: The second zodiac sign, spanning 30 to 60 degrees of longitude, mapped to the Earth element and its symbol.
- **temporality**: Tag dimension classifying an event as Instant or Duration, computed in the tag map from whether its start equals its end.
- **tilt**: Inclination of the Moon's shadow track relative to the ecliptic, a parameter of the eclipse geometry tests.
- **topocentric**: Describes positions and rise times seen from the observer's location rather than Earth's centre, used for horizon and local eclipse events.
- **totality**: Phase of a total eclipse when the Sun or Moon is fully covered, classified by the eclipse calculation and classification services.
- **trace**: Verb for following constellation lines through catalog star vertices, as in traceConstellationLines in the night-sky module.
- **tredecile**: Specialty aspect at exactly 108 degrees, detected by the specialty-aspects module from the harmonic division of the circle.
- **trine**: Major aspect at exactly 120 degrees of separation, one of the five major aspects and the base of grand trine patterns.
- **triple**: Compound aspect of three bodies, such as grand trine, hammer, T-square, or yod, detected by the triple-aspects module.
- **twilight**: Period between sunset and full darkness, with civil, nautical, and astronomical boundaries computed by the twilights module.
- **umbral**: Adjective for the darkest eclipse shadow, the umbra, used in magnitude and contact timing for eclipse classification.
- **undecile**: Specialty aspect at about 32.73 degrees, one eleventh of a circle, detected by the specialty-aspects module.
- **undecuple**: Compound pattern of eleven bodies in conjunction, labelled an undecuple stellium in the stellium constants.
- **under**: Preposition in code comments placing a helper beneath a section or directory, such as module folders under src/modules.
- **updatable**: Adjective for entities that extend the shared SqliteUpdatableEntity base, which adds the timestamp columns each row carries.
- **uranus**: One of the outer planets in the caelundas body list, whose positions and aspects come from the ephemeris.
- **usno**: US Naval Observatory, the almanac whose phase and twilight times this project matches, and whose published tables are reference fixtures.
- **ut**: Universal Time, the timescale for event timestamps, with the Horizons and ephemeris notes stating times in UT.
- **velocity**: Daily velocity of a body requested alongside its position, whose sign reveals retrograde motion in ephemeris requests.
- **venusian**: Adjective for Venus-specific phase events, such as morning and evening star visibility spans in the Venusian phase service.
- **verb**: Label in event metadata that maps each aspect phase to its lowercase form, such as forming, dissolving, or perfective.
- **vernal**: Describes the vernal equinox, the spring point of the annual solar cycle that the event service emits as an event.
- **vertex**: Corner point of a constellation figure, matched to a catalog star within 0.05 degrees by the night-sky utilities.
- **vesta**: One of four asteroids tracked as a body in aspects and positions, and usable as a vertex in sextuple hexagram composition.
- **virgo**: The sixth zodiac sign, spanning 150 to 180 degrees of longitude, mapped to the Earth element and its symbol.
- **visibility**: Morning or evening star visibility span of Mercury, Venus, or Mars, the time a planet is seen before sunrise or after sunset.
- **visible**: Adjective for a solar eclipse seen from the observer's location, which keeps its local type while the Sun is above horizon.
- **water**: Element that the tag dimensions assign to the cancer, scorpio, and pisces signs, tagging their events as water-sign events.
- **winter**: Season label for the winter solstice and the autumn-to-winter half of the annual solar cycle events.
- **yod**: Three-body aspect pattern of a sextile base with two quincunxes meeting at an apex, detected by the triple-aspects service.
- **zenith**: Highest altitude a body reaches each day, which daily cycles turn into solar noon and lunar culmination calendar events.
- **zodiac**: Twelve tropical signs of 30 degrees each, the ecliptic segments that ingresses, decans, and sign mapping use here.

<!-- coinagerie:end -->
