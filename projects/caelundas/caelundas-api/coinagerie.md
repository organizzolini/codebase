<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **accept**: The `accept-encoding` request header a client sends to ask for a compressed response.
- **alioth**: A bright star of Ursa Major, used as a fixture in the night-sky unit tests.
- **altitude**: Angle above the horizon in degrees; `bottomAltitudeDegrees` sets the lowest altitude the night sky draws.
- **anchor**: An instant on the day a calendar view opens on, from which the windows service works out the period to show.
- **angle**: The rotation in degrees the night sky is drawn at, set by sidereal time and the observer's longitude.
- **appearance**: The night-sky options that set how the sky looks, such as colors and line widths, filled with defaults together.
- **ascension**: Right ascension, a sky point's east-west coordinate in hours.
- **aspect**: An angular relationship between two bodies, the root tag most calendar events are filed under.
- **azimuth**: Compass bearing along the horizon, which a unit test reads to tell east from west.
- **conjunct**: The zero-degree aspect, as events and tags name it, such as Moon Conjunct Mars.
- **constellation**: A named star figure the night sky draws on request, chosen by name, `all`, `zodiac`, or `none`.
- **db**: Part of the `@codebase/caelundas-db` package name, the entities and database module this API reads through.
- **declination**: A sky point's north-south coordinate in degrees.
- **degree**: The angle unit of night-sky inputs and geometry, as in `latitudeDegrees`.
- **designation**: A constellation's three-letter IAU abbreviation, such as `UMa`.
- **dubhe**: A bright star of Ursa Major, used as a fixture in the night-sky unit tests.
- **early**: Test name for the earlier of two requests whose night skies are compared.
- **earth**: The planet whose rotation rate sets how fast the night sky turns, `EARTH_ROTATION_RADIANS_PER_SECOND`.
- **ecliptic**: The Sun's yearly path across the sky, which the night sky draws as a line on request.
- **epoch**: The Unix epoch, whose Julian day converts a timestamp for the sidereal-time calculation.
- **equinox**: The moment the Sun crosses the celestial equator, used as a sample event and tag in filter tests.
- **greenwich**: The prime meridian; Greenwich sidereal time plus the observer's longitude gives the sky's rotation.
- **harmonic**: A numbered aspect family, such as Harmonic 6, whose trailing number filters can compare.
- **hip**: A star's Hipparcos catalog number, which keys each star and each end of a constellation line.
- **horizon**: The line where the sky meets the ground; also the `astronomy-engine` function a unit test checks positions with.
- **ingress**: A body's entry into a zodiac sign, a tag that filter tests select events by.
- **instant**: An event whose start and end are equal, the `Instant` value of the temporality field.
- **j2000**: The standard astronomical epoch of 1 January 2000, whose Julian day the sidereal-time calculation counts from.
- **julian**: The Julian day, a continuous count of days that the sidereal-time calculation converts timestamps into.
- **july**: A test name for the windows computed for July 2026.
- **latitude**: The observer's north-south position in degrees, which sets how high the pole sits in the night sky.
- **longitude**: The observer's east-west position in degrees, which with sidereal time sets the sky's rotation.
- **lyra**: A constellation used as a fixture when no database is present.
- **magnitude**: A star's brightness, where a lower number is brighter; `faintestMagnitude` limits which stars are drawn.
- **middleware**: The NestJS request middleware the API module configures, such as response compression.
- **moon**: The Moon, as a body named in sample events and tag paths.
- **north**: The direction of positive declination, as in the ecliptic's northernmost point.
- **obliquity**: The tilt of Earth's axis, about 23.4 degrees, used to convert ecliptic longitude into right ascension and declination.
- **observer**: The viewer on Earth, whose time zone and position decide which events and which sky are shown.
- **period**: A range of dates, start inclusive and end exclusive, that a read of events covers. In night sky, the seconds one animation cycle takes.
- **phase**: The tag root holding `Forming` and `Dissolving`, the stages of an aspect that event queries leave out.
- **planet**: The tag root whose paths name a body, as in `Planet / Mars / Retrograde`.
- **polar**: Measured from the celestial pole, as in the polar distance of the top and bottom of the view.
- **pole**: The north celestial pole, the point the night sky rotates around.
- **preset**: A named filter the calendar offers, such as Highlights, that a
  reader applies in one step instead of building its rules by hand. Everyday
  "preset" suggests a factory setting; here it is a list of rules written by
  tag name that the API resolves against the tags the data has, leaving out
  any whose tags are all missing. Declared in `PRESETS` in
  `presets.constants.ts`, resolved by `resolvePresets` in
  `presets.utilities.ts`, and served as `PresetEntity` in
  `preset.entities.ts`.
- **quarter**: The calendar quarter of the year, one of the levels events can be grouped by.
- **radius**: Distance in pixels from the pole, as in the inner and outer radius of the rings stars are drawn on.
- **reddest**: Test name for the stars at the red end of the color ramp.
- **retrograde**: A planet's apparent backward motion, as a tag and sample event.
- **rotation**: The turning of the night sky around the pole, at Earth's rotation rate.
- **scorpius**: A constellation used as a fixture in the night-sky input tests.
- **sidereal**: Sidereal time, the angle of the stars overhead, from which the night sky's starting rotation is computed.
- **sky**: The night sky the API renders as an SVG of stars, constellation figures, and the ecliptic.
- **south**: The direction of negative declination or latitude; see `southern`.
- **southern**: Test name for a request from a southern latitude, which the night sky refuses.
- **star**: A catalog star the night sky draws, sized and colored by its magnitude and color.
- **sun**: The Sun as a body; the word also appears inside Sunday, weekday 0.
- **temporality**: Filter field classing an event as `Instant` or `Duration`.
- **trace**: The method that returns the ecliptic as a run of sky points to draw.
- **tuesday**: Test name for a count of events that fall on a Tuesday.
- **unfinished**: A filter rule missing a value it needs, which is dropped rather than compiled.
- **ursa**: First word of Ursa Major, written `ursa_major` when naming a constellation to draw.
- **vega**: A bright star of Lyra, used as a fixture when no database is present.
- **visible**: The period of days a calendar view shows, as opposed to the wider period read around it.
- **weekday**: The day of the week an event starts on, numbered from Sunday as 0, a field to filter and group by.
- **window**: A calendar layout the UI calls a View: agenda, day, three-day, week, month or timeline. In night sky, the viewport size the sky is drawn to fit.
- **zodiac**: The twelve constellations the ecliptic crosses, the default set of figures the night sky draws.

<!-- coinagerie:end -->
