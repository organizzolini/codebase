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
| Compound aspects | Triple (grand trine, hammer, T-square, yod), quadruple (boomerang, butterfly, cradle, grand cross, hourglass, kite, mystic rectangle), pentagram, hexagram, and stelliums of three or more bodies |
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
