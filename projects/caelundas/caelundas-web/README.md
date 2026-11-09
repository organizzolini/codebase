## Develop

```bash
nx run caelundas-web:start
```

The app holds no data of its own: every event, facet, filter collection,
calendar window and night-sky star comes from the `caelundas-api` GraphQL
API, which reads the Caelundas Postgres. Bring those up first, then the app:

```bash
# 1. Start the local Postgres (docker compose) and create the schema
nx run caelundas-db:migration:run

# 2. Fill it with events and the night sky, as caelundas-cli's README describes
nx run caelundas-cli:download-ephemeris
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env
nx run caelundas-cli:start

# 3. Serve the API on port 6173, then the app
cp projects/caelundas/caelundas-api/.env.default projects/caelundas/caelundas-api/.env
nx run caelundas-api:start
```

The dev and preview servers listen on port 8967, derived from the project name
with `scripts/shell/text-to-port.sh caelundas-web` as every other application's
is, and `nx run caelundas-web:stop` frees it.

The API's address is the `VITE_CAELUNDAS_API_URL` variable, read when the app
is built or served, `http://localhost:6173/graphql` when unset. Point it at
another API before a build:

```bash
VITE_CAELUNDAS_API_URL=https://api.example.test/graphql nx run caelundas-web:build
```

The browser calls the API directly, so the API must allow this app's origin.

## Generate the API client

`src/graphql/generated/` is committed output of GraphQL Code Generator, from
the documents in `src/graphql/operations/` and the schema `caelundas-api` writes
to the gitignored `caelundas-api/src/schema.gql` each time it boots. Boot the
API once before generating. The build never needs it: it reads the committed
files.

```bash
nx run caelundas-web:codegen          # Regenerate from the API's schema
nx run caelundas-web:codegen:check    # Fail when a committed file is stale
nx run caelundas-web:codegen-watch    # Start the API and regenerate on change
```

## Test

```bash
nx run caelundas-web:vitest
```

## Night sky link parameters

The backdrop reads these from the page link; a value that does not parse falls
back to its default. The toolbar's Sky menu sets every one of them
but `sky.debug`, reading the link and writing it back as a control moves, and
removes a key set back to its default. Its Default button removes them all
but `sky.debug`. Colors are text of three or six hexadecimal digits,
with or without the `#`. Write the `#` as `%23`, for example `sky.top=%23102040`:
the router reads an all-digit value such as `123456` or `1e5` as a number,
which cannot be told from the color it was meant to be, so a number falls back
to the default.

- `sky=off` removes the backdrop.
- `sky.lat` and `sky.lon` move the observer, the north pole (90) and New
  York's longitude by default; a latitude of 0 or below draws nothing. The
  view faces north, and at the pole altitude is declination.
- `sky.vFov` sets the degrees of altitude shown, 90 by default, and
  `sky.altBottom` the altitude at the bottom edge, from -45 to 89 and 0 by
  default, so the default view, the whole sky above the horizon from the
  pole, holds the northern half of the ecliptic and the northern zodiac's
  figures as they turn past; a bottom below the horizon reaches further south. The pole
  stays a degree above the top edge, so a field of view that would show it is
  cut to fit, 89° at the defaults, and a cut of more than that degree is
  warned of once.
- `sky.pixelsPerSecond` sets the drift speed in on-screen pixels per second,
  3 by default.
- `sky.maxMag` sets the faintest magnitude drawn, and `sky.starScale`
  multiplies the dot size.
- `sky.top` and `sky.bottom` set the colors at the top and bottom of the
  background, `04060f` and `0d1533` by default.
- `sky.constellations` draws constellation figures beneath the stars: a
  comma-separated list of full names, lower case with spaces or hyphens as
  underscores, such as `ursa_major` or `canis_major`, and the words `all` and
  `zodiac` (the twelve zodiac constellations), combined as in
  `sky.constellations=zodiac,ursa_major`. Absent, it draws the zodiac's; `all`
  draws all 88, and `none`,
  or an empty value (`sky.constellations=`), draws none. A name it does not know
  is left out, with one console warning. Facing north from mid-northern
  latitudes the zodiac lies below the window, so its figures show there only
  with a lower `sky.altBottom`.
- `sky.lineColor`, `sky.lineOpacity` and `sky.lineWidth` stroke the figures:
  a color like `sky.top`'s, `ffffff` by default; an opacity from 0 to 1,
  `0.24` by default; and a width in on-screen pixels from 0 to 10, `0.8` by
  default. A number out of range is clamped, and a value that does not parse
  falls back to the default with one console warning.
- The ecliptic, the Sun's yearly path and the line the zodiac lies along, is
  drawn as a dashed path beneath the stars; `sky.ecliptic=false` hides it.
  `sky.eclipticColor`, `sky.eclipticOpacity` and `sky.eclipticWidth` stroke it
  like the figures' keys, `ffffff`, `0.12` and `1` by default. It lies within
  23.44° of the celestial equator, so it shows only where the window reaches
  that far south; the default band holds its northern half.
- `sky.debug=true` draws the zoomed-out tuning view.

## Stars and constellations

The API draws the night sky from its `stars`, `constellations` and
`constellation_lines` tables, which `caelundas-cli`'s `night-sky` command fills,
and this app shows the SVG its `nightSky` query returns. The list of all 88
constellations in the Sky menu is a constant in `night-sky.constants.ts`.

The stars are the [HYG star database](https://github.com/astronexus/HYG-Database)
v4.1, stored to magnitude 6.5 at declination -45 degrees or north, plus any
fainter star a figure joins. HYG is licensed
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) and the stored
catalog is a derived work, so it carries the same license and credit to David
Nash and the HYG contributors. The constellations and their figures come from
[d3-celestial](https://github.com/ofrohn/d3-celestial), BSD-3-Clause, Olaf
Frohn, after the IAU's constellation charts.

## 👔 Conformetry

This project was generated from the [tanstack-application](/configuration/conformetry-templates/tanstack-application) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run caelundas-web:coinagerie-check:write`.

- **air**: One of the four sign elements used as a filter field, with a value of fire, earth, air or water.
- **alt**: Short form in the sky settings key altBottom, the lowest altitude the night sky draws, beneath the horizon.
- **altitude**: Height of a star above the horizon in degrees, where the pole observer sees altitude equal declination, shown by the night sky.
- **anchor**: Names a date or position a calendar timeline is laid out from, passed as the anchor date prop to the timeline.
- **angle**: Degree rotation the night sky star group is drawn at, derived from sidereal time as the sky turns.
- **aquarius**: Zodiac sign and constellation name whose sign glyph maps to its icon file in the calendar glyphs.
- **aspect**: Angular relationship between two bodies, such as a conjunction or a harmonic, filtered and colored as a tag root.
- **astraea**: Asteroid whose name the project does not use in code; it appears only in the glossary list here.
- **astronomical**: Twilight stage, such as Astronomical Dawn or Dusk, that the calendar labels and draws with a glyph icon.
- **beltane**: Cross-quarter festival date, which the calendar marks with a flower glyph and its own icon image.
- **binovile**: Harmonic aspect at two novile steps that appears in the glossary list but has no code or icon in this project.
- **biquintile**: Aspect of 144 degrees, two quintile steps, drawn with a dedicated 144-degree icon in calendar glyphs.
- **biseptile**: Aspect of about 103 degrees, two septile steps, that the project lists only in its glossary.
- **boomerang**: Emoji-keyed glyph image that the calendar draws for one event category, mapped from the boomerang emoji.
- **border**: Outline drawn around agenda date and group surfaces, through class names that set their edges in the calendar.
- **boundary**: Index splitting an event summary into its glyph symbols and English name, so the name is cut at that index.
- **breadth**: Callidescope limit on how many calls a callable fans out to, declared as maximumBreadth in its configuration.
- **brightness**: Glyph for the maximum brightness event, keyed by a bright emoji and drawn from maximum-brightness-icon.svg.
- **butterfly**: Emoji-keyed icon image, butterfly-icon.png, the calendar shows for one of its event label symbols.
- **cancer**: Zodiac sign whose ingress event, such as event-sun-ingress-cancer, the filter tests and collections reference by id.
- **capricorn**: Zodiac sign whose glyph maps to capricorn-icon.svg, which the calendar icon utilities test checks by name.
- **cardinal**: Modality value for a zodiac sign, one of cardinal, fixed or mutable, offered as a filter value.
- **cascade**: Tag picker prop that, when true, makes ticking a parent tag tick the tags beneath it; group picker sets it false.
- **chiron**: Centaur asteroid whose symbol maps to chiron-icon.svg in the calendar glyph constants and utility tests.
- **civil**: Twilight stage of dawn or dusk labeled Civil Dawn or Civil Dusk, each with its own calendar glyph icon.
- **conjunction**: Aspect at zero degrees between two bodies, with harmonic 1 and its own conjunction-0 icon in the glyph map.
- **constellation**: Named star pattern the night sky draws with its own lines, from catalog records, listed as folders in the sky menu.
- **contraparallel**: Aspect between bodies with equal declination on opposite sides of the equator; the project lists it only here.
- **cradle**: Calendar glyph mapped from the bed emoji to cradle-icon.png, used for one event label in the glyph map.
- **crescent**: Moon phase between new and quarter, offered as a filter value and drawn with waxing or waning crescent icons.
- **cut**: Verb for removing or trimming: a view is added or cut from the list, and night sky rings are cut at the window edge.
- **dawn**: Twilight start of morning, labeled Astronomical or Civil Dawn, each with its glyph in calendar icon constants.
- **daylight**: Event label for the sun above the horizon, mapped to day-icon.svg as its calendar glyph.
- **decan**: Ten-degree third of a zodiac sign, numbered and drawn with the decan digit keycap in calendar glyphs.
- **decile**: Aspect of 36 degrees, one tenth of the circle, drawn with its own decile-36 icon image in calendar glyphs.
- **decuple**: Tenth-harmonic group of 36-degree aspects, labeled a stellium in the CLI symbol map and absent from this project.
- **degree**: Angle unit for all night sky coordinates, such as the 90-degree default vertical field and full turns.
- **dignity**: Filter field for planet strength in a sign, such as domicile or exaltation, used as a tag root.
- **domain**: Tag group recording whether an event belongs to the solar, lunar or planetary sphere, and the Nx domain tag this project carries.
- **duodecuple**: Twelfth-harmonic group of 30-degree aspects, labeled a stellium in the CLI symbol map and absent from this project.
- **dusk**: Evening twilight stage, labeled Astronomical Dusk, Astronomical Twilight Evening or Civil Dusk, each with its own icon.
- **earth**: Earth-centered reference in the Eclipse Frame filter, and the element name of earth signs in the Element filter.
- **eclipse**: Event type for solar or lunar eclipses, colored red in the Type color scheme and offered in the Eclipse Frame filter.
- **ecliptic**: Yearly path the Sun appears to follow across the sky, drawn as a line with style keys for color and width.
- **element**: Classification of a zodiac sign as fire, earth, air or water, offered as a filter field and tag group.
- **elongation**: Angular distance of a planet from the Sun, its stage shown by east or west arrow glyphs on the calendar.
- **eris**: Dwarf planet Eris, a body whose aspects the CLI's triple-aspect tests tag; the web app never names it.
- **fire**: A value of the Element filter that marks a sign as belonging to the fire element.
- **focal**: The body a pattern points at, such as a T-square's apex, named in the event filter's Focal Body field.
- **fov**: The vertical angle in degrees the night sky shows, set by the sky.vFov link key read from the page link.
- **gap**: The spacing between a flex or grid layout's items, set with Tailwind gap utilities such as gap-2 in the calendar.
- **gemini**: The zodiac sign of the twins, mapped from ♊ to its icon and drawn as a night-sky constellation figure.
- **geocentric**: An Earth-centered eclipse marker, drawn as a globe emoji with its own SVG icon in the event glyph table.
- **gibbous**: The Moon's phase between quarter and full, as the phase filter and its waxing and waning icons name it.
- **gonggong**: A trans-Neptunian dwarf planet whose name no source or test file uses; only the glossary mentions it.
- **grand**: Part of a three-or-more-body aspect pattern name, like grand trine or grand cross, in the collections and icon table.
- **hammer**: The event glyph for the hammer emoji, mapped to its PNG icon file in the calendar icon table.
- **hang**:
- **harmonic**: A numbered aspect family, such as Harmonic 4, whose tags the calendar filters and agenda group under Type.
- **hebe**: A main-belt asteroid whose name no source or test file uses, leaving only the glossary headword.
- **hexadecan**: A sixteenth-harmonic point of the zodiac, named by ordinal such as Fifth Hexadecan, which the CLI emits as an event.
- **hexagram**: The dotted six-pointed star emoji, mapped to its PNG icon in the calendar icon table.
- **hourglass**: The ⏳ emoji event glyph, mapped to its PNG icon in the calendar icon table.
- **hygiea**: A main-belt asteroid no source or test file names, so this headword lives only in the glossary.
- **imbolc**: The cross-quarter festival of early February, mapped to its PNG icon in the event glyph table.
- **ingress**: A planet's entry into a new zodiac sign, tagged Type / Ingress so the calendar can color and filter it.
- **instant**: A zero-length event: a moment with no duration, which the duration filter and legend list as Instant.
- **ixion**: A trans-Neptunian plutino dwarf planet, not named in any source or test file, so only the glossary records it.
- **juno**: The asteroid symbol ⚵ mapped to juno-icon.svg in the event glyph table, so that body's events get an icon.
- **jupiter**: The planet symbol ♃ mapped to jupiter-icon.svg in the event glyph table, and named in glyph test event titles.
- **kite**: An aspect pattern shape named in the focal body filter, whose emoji 🪁 maps to kite-icon.png.
- **lamma**: The cross-quarter festival at 135 degrees, emitted as a CLI event and mapped to a PNG icon in the web glyph table.
- **latitude**: The observer's north-south angle, read from sky.lat to place the night sky, and a column of each calendar event.
- **leaf**: A tag or group with no children, which stands for itself: a leaf is its own group at any depth below it.
- **leo**: The zodiac sign of the lion, whose ♌ glyph maps to leo-icon.svg and tags events as Sign / Leo.
- **libra**: The scales sign of the zodiac, ♎ mapped to libra-icon.svg, and a constellation folder the night-sky picker lists.
- **lilith**: The Black Moon point, the lunar apogee body whose ⚸ glyph maps to its SVG icon in the glyph table.
- **litha**: The summer solstice festival whose 🌞 emoji maps to litha-icon.png in the event glyph table.
- **longitude**: The observer's east-west angle, read from sky.lon to place the night sky, and the zodiacal longitude of an event.
- **lunar**: Tied to the Moon: the daily and monthly lunar cycle tags, colored by the calendar's color-by scheme.
- **mabon**: The autumn equinox festival whose 🍂 emoji maps to mabon-icon.png in the calendar's event glyph table.
- **mag**: The magnitude unit suffix, written as mag after a star's brightness value in the night-sky menu's labels.
- **magnitude**: A star's brightness on the astronomical scale, lower being brighter, stored per star and capped by the faintest-star setting.
- **makemake**: A dwarf planet of the Kuiper belt that no source or test file names, leaving only this glossary entry.
- **mercury**: The innermost planet, named in the calendar's color scheme tests and in a Mercury retrograde filter fixture.
- **modality**: A zodiac sign's quality, cardinal, fixed or mutable, offered as a filter field and tag group for events.
- **moon**: Tag path naming the Moon, whose events a without-the-Moon collection excludes from its planetary aspect set.
- **mutable**: One of the three sign modalities, alongside cardinal and fixed, offered as a value in the event filters.
- **mystic**: Name root of the aspect pattern whose door emoji maps to a PNG icon in the event glyph set.
- **nadir**: Event name for the lowest point of the Sun or a planet below the horizon, shown with a down-arrow icon.
- **nautical**: Sun-altitude twilight events, the Dawn, Dusk and Evening variants, each mapped to its own SVG icon.
- **negative**: The polarity of a sign, either positive or negative, offered as a filter value.
- **neptune**: A planet whose glyph and icon label its events, as in Moon sextile Neptune.
- **nessus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **nonuple**: Stellium label for a cluster of nine bodies, mapped to a symbol in the stellium constants.
- **north**: The lunar north node glyph, mapped to its own SVG icon, and the north pole facing the sky view.
- **novile**: Harmonic aspect at 40 degrees, the ninth harmonic, named in event labels such as Sun novile Pluto.
- **observer**: The viewer position on Earth, from which local times, horizons and eclipses are measured.
- **octile**: An aspect at 45 degrees, the eighth harmonic, mapped to its own PNG icon.
- **octuple**: Stellium label for a cluster of eight bodies, mapped to a symbol in the stellium constants.
- **ophicus**: Constellation name for a body or sign outside the twelve zodiac signs, unused by any code here.
- **opposition**: The 180-degree aspect, harmonic 2, mapped to its own PNG icon in the glyph set.
- **orcus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **ostara**: Seasonal festival event, the spring equinox name here, mapped to a PNG icon in the glyph set.
- **palla**: Asteroid Pallas, named in event labels such as Mars biquintile Pallas, with its own glyph.
- **pentagram**: The star glyph for a five-pointed pattern, mapped to its own PNG icon in the glyph set.
- **phase**: Lunar or planetary cycle stage, a filter and color field grouping events by cycle position.
- **pholus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **pisce**: Zodiac sign whose glyph maps to its own SVG icon, and a constellation listed in the sky menu.
- **place**: A position in a color legend where values without one take their color from their own text.
- **planet**: A celestial body whose glyph, name and events the calendar shows, such as Mars or Jupiter.
- **pluto**: Dwarf-planet body whose glyph maps to its own SVG icon and appears in event names.
- **polarity**: Whether a zodiac sign is positive or negative, offered as a filter field and a color group.
- **pole**: The north celestial pole at the top of the night-sky view, where altitude equals declination.
- **presentation**: The shared UI primitives package of Button and Skeleton, which the app imports from.
- **prograde**: Direction of a planet moving forward through the zodiac, mapped to its own SVG icon.
- **prop**: React inputs passed to a component, named as properties in this codebase rather than props.
- **quadruple**: Stellium label for four bodies clustered together, mapped to a PNG icon in the glyph set.
- **quaoar**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **quarter**: Calendar quarter of the year, a group field keying events like 2026-Q1, and a Moon phase.
- **quiet**: Class string that hides the timeline bar labels, keeping the timeline uncluttered.
- **quincunx**: The 150-degree minor aspect, mapped to its own PNG icon in the glyph set.
- **quintile**: The 72-degree aspect, a fifth-harmonic, mapped to its own PNG icon in the glyph set.
- **quintuple**: Label for the CLI quintuple aspects module, computing five-fold harmonic aspect groupings.
- **radial**: A radialGradient SVG fill, the star glow and ground shading drawn behind the night sky.
- **rectangle**: Shape word in the Mystic Rectangle aspect name, mapped to its own PNG icon via a door emoji.
- **retrograde**: Apparent backward motion of a planet, a station event with its own icon in the glyph set.
- **rise**: A planet stage relative to the Sun, such as rising or setting, in the planetary phase filter.
- **role**: ARIA attribute on a status or alert region, so screen readers announce empty and error states.
- **samhain**: Seasonal festival event at a cross-quarter day, mapped to its own PNG icon in the glyph set.
- **saturn**: Ringed planet whose glyph and aspect events, such as Mars squares, appear across the calendar.
- **scorpio**: Zodiac sign of the scorpion, whose glyph maps to its own SVG icon in the glyph set.
- **season**: A filter and color field giving the time of year an event falls in, such as spring.
- **sedna**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **selector**: A control that picks one option from a list, such as the view or scale menu in the toolbar.
- **semisextile**: The 30-degree minor aspect, mapped to its own PNG icon in the glyph set.
- **septile**: The 51.43-degree aspect, a seventh harmonic, mapped to its own PNG icon in the glyph set.
- **septuple**: Stellium label for a cluster of seven bodies, mapped to a symbol in the stellium constants.
- **sextile**: The 60-degree aspect, a harmonic-six pattern, shown in event names with the star glyph.
- **sextuple**: Stellium label for six bodies clustered together, mapped to its own PNG icon in the glyph set.
- **sibling**: A neighboring element under the same parent, which focus moves between in the tag picker.
- **sky**: The night-sky backdrop behind the calendar and its settings, such as sky.top, sky.lat and sky.lon.
- **south**: The descending lunar node glyph, mapped to its own SVG icon beside the north node.
- **square**: The 90-degree aspect, a harmonic-four pattern, shown in event names beside its glyph.
- **star**: Celestial point in the night sky, as in the morning-star and evening-star icons and the sky backdrop.
- **stellium**: Cluster of three or more bodies in one sign or spot, named by its count and given a glyph icon.
- **sun**: Central body of the solar system, whose glyph and events label Sun-relative stages and twilight.
- **synodic**: Planet-with-Sun cycle label, a filter field and tag group for each planet stage.
- **taurus**: Zodiac sign of the bull, whose glyph maps to its own SVG icon, and a constellation in the sky menu.
- **temporality**: Derived filter field classing an event as past, ongoing or upcoming relative to the current time.
- **trapeze**: Four-body aspect pattern that no code in this project uses, so only this glossary names it.
- **tridecile**: The 108-degree aspect, mapped to its own PNG icon in the glyph set.
- **trine**: The 120-degree aspect, a harmonic-three pattern, shown in event names with a triangle glyph.
- **trioctile**: The 135-degree aspect, mapped to its own PNG icon in the glyph set.
- **triple**: Compound aspect group of three bodies, mapped to the three-body stellium icon.
- **triseptile**: A 154.29-degree aspect in the seventh-harmonic family, which no code in this project uses.
- **twilight**: Sun-altitude dusk and dawn stage, a Type value with civil, nautical and astronomical bands.
- **typhon**: Centaur body name that no code in this project uses, so it survives only as a glossary entry.
- **undecile**: The 32.7-degree aspect, an eleventh-harmonic pattern, shown in event names with its own SVG icon.
- **undecuple**: Stellium label for eleven bodies clustered together, mapped to a symbol in the stellium constants.
- **unfinished**:
- **unmeasured**: Stand-in size used before a virtual list is measured, a 720 by 640 default height and width.
- **unmount**:
- **uranus**: Ice giant body whose glyph maps to its own SVG icon in the glyph set.
- **vesta**: Asteroid body whose glyph maps to its own SVG icon in the event glyph set.
- **vigintile**: A 18-degree aspect, a twentieth-harmonic division, which no code in this project uses.
- **virgo**: Zodiac sign of the maiden, whose glyph maps to its own SVG icon, and a constellation in the sky menu.
- **visibility**: Eclipse filter field saying whether an eclipse is measured from Earth center or the observer.
- **visible**: Shown on screen, such as the visible rows the virtual list computes for its window.
- **water**: Elemental class of a zodiac sign, one of fire, earth, air or water, offered as a filter value.
- **weekday**: Calendar day of the week as a grouping and color field, such as Monday through Sunday.
- **yod**: Compound aspect pattern, the Yod, a Compound Aspect variant in the color path tests.
- **york**:
- **yule**: Seasonal festival event at the winter solstice, mapped to its own PNG icon in the glyph set.
- **zenith**: Point directly overhead, shown as an upward-arrow event glyph with its own SVG icon.
- **zodiac**: Twelve signs along the ecliptic, the sky backdrop default constellation set and a filter group.

<!-- coinagerie:end -->
