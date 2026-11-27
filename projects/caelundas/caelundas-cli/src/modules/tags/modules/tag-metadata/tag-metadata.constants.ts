// ♟️ Constants

/** A node's icon slug and note, by path. */
export const TAG_METADATA: Readonly<
  Record<string, readonly [icon: string, note: string]>
> = {
  Aspect: ["shapes", "Angles between bodies, and the patterns they form."],
  "Aspect / Compound": [
    "hexagon",
    "Patterns of three or more bodies linked by aspects.",
  ],
  "Aspect / Compound / Focal Body": [
    "crosshair",
    "The body a compound pattern points at.",
  ],
  "Aspect / Compound / Quadruple": ["square", "Patterns of four bodies."],
  "Aspect / Compound / Quintuple": ["pentagon", "Patterns of five bodies."],
  "Aspect / Compound / Sextuple": ["hexagon", "Patterns of six bodies."],
  "Aspect / Compound / Stellium": [
    "sparkles",
    "Bodies bunched together, counted by how many.",
  ],
  "Aspect / Compound / Triple": ["triangle", "Patterns of three bodies."],
  "Aspect / Harmonic": [
    "audio-waveform",
    "The harmonic of an aspect: 1 for a conjunction, 2 an opposition, 3 a trine, 4 a square, and so on.",
  ],
  "Aspect / Nature": ["scale", "Whether an aspect is hard, soft or neutral."],
  "Aspect / Nature / Hard": ["zap", "Tense aspects, such as squares."],
  "Aspect / Nature / Neutral": ["circle", "Aspects that are neither."],
  "Aspect / Nature / Soft": ["waves", "Easy aspects, such as trines."],
  "Aspect / Phase": [
    "hourglass",
    "Where an aspect sits in its span: forming, exact or dissolving.",
  ],
  "Aspect / Phase / Dissolving": [
    "trending-down",
    "The bodies are separating.",
  ],
  "Aspect / Phase / Exact": ["circle-dot", "The moment the aspect is exact."],
  "Aspect / Phase / Forming": ["trending-up", "The bodies are approaching."],
  "Aspect / Simple": ["triangle", "Aspects between two bodies."],
  "Aspect / Simple / Major": ["star", "The five classical aspects."],
  "Aspect / Simple / Minor": ["sparkle", "Aspects of the second rank."],
  "Aspect / Simple / Specialty": ["gem", "Rare aspects of higher harmonics."],
  Body: ["globe", "The bodies an event involves, grouped by class."],
  "Body / Asteroid": ["mountain", "Asteroids and Chiron."],
  "Body / Luminary": ["sun-moon", "The Sun and the Moon."],
  "Body / Planet": [
    "earth",
    "The planets, by how far they reach and by tradition's fortune.",
  ],
  "Body / Planet / Benefic": [
    "smile",
    "The bodies tradition counts as fortunate: Venus and Jupiter.",
  ],
  "Body / Planet / Malefic": [
    "frown",
    "The bodies tradition counts as difficult: Mars and Saturn.",
  ],
  "Body / Planet / Outer": ["telescope", "Uranus, Neptune and Pluto."],
  "Body / Planet / Personal": ["user", "Mercury, Venus and Mars."],
  "Body / Planet / Social": ["users", "Jupiter and Saturn."],
  "Body / Point": [
    "map-pin",
    "Calculated points: Lilith, the lunar nodes and apsides.",
  ],
  Daily: ["clock", "Events that repeat every day."],
  "Daily / Lunar Cycle": [
    "moon",
    "The Moon's day: rise, zenith, set and nadir.",
  ],
  "Daily / Lunar Cycle / Moon Up": [
    "moon",
    "The Moon is above the horizon, from moonrise to moonset.",
  ],
  "Daily / Lunar Cycle / Nadir": [
    "arrow-down-to-line",
    "The Moon's lowest point.",
  ],
  "Daily / Lunar Cycle / Rise": [
    "sunrise",
    "The Moon crosses the horizon upward.",
  ],
  "Daily / Lunar Cycle / Set": [
    "sunset",
    "The Moon crosses the horizon downward.",
  ],
  "Daily / Lunar Cycle / Zenith": [
    "arrow-up-to-line",
    "The Moon's highest point.",
  ],
  "Daily / Solar Cycle": ["sun", "The Sun's day: rise, zenith, set and nadir."],
  "Daily / Solar Cycle / Nadir": [
    "arrow-down-to-line",
    "The Sun's lowest point.",
  ],
  "Daily / Solar Cycle / Rise": [
    "sunrise",
    "The Sun crosses the horizon upward.",
  ],
  "Daily / Solar Cycle / Set": [
    "sunset",
    "The Sun crosses the horizon downward.",
  ],
  "Daily / Solar Cycle / Zenith": [
    "arrow-up-to-line",
    "The Sun's highest point.",
  ],
  "Daily / Time of Day": [
    "clock",
    "Whether a twilight falls in the morning or the evening.",
  ],
  "Daily / Twilight": ["cloud-sun", "The stages between day and night."],
  Eclipse: ["eclipse", "Solar and lunar eclipses."],
  "Eclipse / Frame": ["scan", "What an eclipse is measured from."],
  "Eclipse / Frame / Geocentric": ["globe", "From the Earth's center."],
  "Eclipse / Frame / Topocentric": ["map-pin", "From the observer's place."],
  "Eclipse / Lunar": ["moon", "The Earth's shadow falls on the Moon."],
  "Eclipse / Phase": [
    "hourglass",
    "Where an eclipse is: beginning, maximum or ending.",
  ],
  "Eclipse / Solar": ["sun", "The Moon covers the Sun."],
  Lunar: ["moon", "The Moon's month and orbit."],
  "Lunar / Apsides": [
    "orbit",
    "The Moon's nearest and farthest points from the Earth.",
  ],
  "Lunar / Apsides / Apogee": [
    "arrow-up",
    "The Moon is farthest from the Earth.",
  ],
  "Lunar / Apsides / Perigee": ["arrow-down", "The Moon is nearest the Earth."],
  "Lunar / Monthly Cycle": [
    "moon-star",
    "The Moon's phases through the month.",
  ],
  Planetary: ["orbit", "The planets' own cycles."],
  "Planetary / Direction": [
    "compass",
    "A planet's apparent direction against the stars.",
  ],
  "Planetary / Direction / Direct Period": [
    "rotate-cw",
    "The span a planet moves forward.",
  ],
  "Planetary / Direction / Retrograde Period": [
    "rotate-ccw",
    "The span a planet moves backward.",
  ],
  "Planetary / Direction / Station Direct": [
    "arrow-right",
    "A planet stops and turns forward.",
  ],
  "Planetary / Direction / Station Retrograde": [
    "undo-2",
    "A planet stops and turns backward.",
  ],
  "Planetary / Phase": [
    "refresh-cw",
    "The phases of Mercury, Venus and Mars in their cycles with the Sun.",
  ],
  "Planetary / Synodic Stage": [
    "milestone",
    "A planet's stage in its cycle with the Sun.",
  ],
  Sign: ["star", "The signs and what they imply."],
  "Sign / Decan": ["layers", "The ten-degree third of a sign a body is in."],
  "Sign / Dignity": ["crown", "How strongly a planet sits in its sign."],
  "Sign / Element": [
    "flame",
    "The element of a sign: fire, earth, air or water.",
  ],
  "Sign / Element / Air": ["wind", "Gemini, Libra and Aquarius."],
  "Sign / Element / Earth": ["mountain", "Taurus, Virgo and Capricorn."],
  "Sign / Element / Fire": ["flame", "Aries, Leo and Sagittarius."],
  "Sign / Element / Water": ["droplets", "Cancer, Scorpio and Pisces."],
  "Sign / Ingress": [
    "log-in",
    "A body enters a sign, or a decan of one, and its stay there.",
  ],
  "Sign / Modality": [
    "repeat",
    "The modality of a sign: cardinal, fixed or mutable.",
  ],
  "Sign / Peak": [
    "split",
    "Which side of a sign's peak, at 15°, a body is on.",
  ],
  "Sign / Polarity": ["plus", "The polarity of a sign: positive or negative."],
  "Sign / Sign": ["star", "The zodiac sign a body is in."],
  Solar: ["sun", "The Sun's year."],
  "Solar / Annual Cycle": [
    "rotate-cw",
    "The turning points of the Sun's year.",
  ],
  "Solar / Annual Cycle / Cross-Quarter Day": [
    "calendar-check",
    "Days midway between a solstice and an equinox.",
  ],
  "Solar / Annual Cycle / Equinox": [
    "equal",
    "Day and night are of equal length.",
  ],
  "Solar / Annual Cycle / Hexadecan": [
    "grid-2x2",
    "The sixteen divisions of the year.",
  ],
  "Solar / Annual Cycle / Interval": [
    "ruler",
    "The sixteen spans between the year's points, each after a named point or before the next.",
  ],
  "Solar / Annual Cycle / Solstice": [
    "sun-medium",
    "The longest and shortest days.",
  ],
  "Solar / Season": ["leaf", "The season of the year."],
  Temporality: [
    "timer",
    "Whether an event is an instant or progresses over time.",
  ],
  "Temporality / Perfective": ["zap", "An instant in time."],
  "Temporality / Progressive": [
    "hourglass",
    "Progressing over a duration of time.",
  ],
};

/** An icon by a node's last name, when its family's is vague. */
export const TAG_ICON_BY_NAME: Readonly<Record<string, string>> = {
  Advancing: "arrow-right",
  Aphelion: "arrow-up-right",
  Autumn: "leaf",
  Beginning: "circle-play",
  Closing: "fold-horizontal",
  Dawn: "sunrise",
  Daylight: "sun",
  Detriment: "trending-down",
  Domicile: "house",
  Dusk: "sunset",
  Ending: "circle-stop",
  Evening: "sunset",
  Exaltation: "trending-up",
  Fall: "arrow-down",
  "First Quarter": "contrast",
  Full: "circle",
  Maximum: "maximize",
  Moon: "moon",
  Morning: "sunrise",
  New: "circle-dot",
  Night: "moon",
  Partial: "contrast",
  Peregrine: "compass",
  Perihelion: "arrow-down-left",
  Retreating: "arrow-left",
  Rise: "sunrise",
  Set: "sunset",
  Spring: "sprout",
  Summer: "sun",
  Sun: "sun",
  Total: "circle",
  Widening: "unfold-horizontal",
  Winter: "snowflake",
};
