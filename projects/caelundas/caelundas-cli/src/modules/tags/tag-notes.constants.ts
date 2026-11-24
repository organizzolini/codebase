// ♟️ Constants

import { ELEMENT_BY_SIGN, MODALITY_BY_SIGN } from "./tag-dimensions.constants";

/** The animal or figure each sign is drawn as, by sign. */
const SIGN_FIGURES: Readonly<Record<string, string>> = {
  aquarius: "the Water Bearer",
  aries: "the Ram",
  cancer: "the Crab",
  capricorn: "the Sea-Goat",
  gemini: "the Twins",
  leo: "the Lion",
  libra: "the Scales",
  pisces: "the Fish",
  sagittarius: "the Archer",
  scorpio: "the Scorpion",
  taurus: "the Bull",
  virgo: "the Maiden",
};

/** The modality of each sign, by sign. */
const MODALITIES: Readonly<Record<string, string>> = MODALITY_BY_SIGN;

/** What each aspect is, named by its angle. */
const ASPECT_NOTES: Readonly<Record<string, string>> = {
  Biquintile: "Bodies 144° apart: a creative, gifted link.",
  Conjunct: "Bodies at the same longitude, 0°: their energies merge.",
  Decile: "Bodies 36° apart: a faint, creative link.",
  Novile: "Bodies 40° apart: a subtle link of completion.",
  Opposite: "Bodies 180° apart: two sides pulling against each other.",
  Quincunx: "Bodies 150° apart: awkward, needing adjustment.",
  Quintile: "Bodies 72° apart: a creative, talent-making link.",
  Semisextile: "Bodies 30° apart: a mild, easily missed link.",
  Semisquare: "Bodies 45° apart: a small irritation.",
  Septile: "Bodies about 51.4° apart: a fated, elusive link.",
  Sesquiquadrate: "Bodies 135° apart: agitation that demands release.",
  Sextile: "Bodies 60° apart: an easy opening to cooperate.",
  Square: "Bodies 90° apart: friction that pushes toward action.",
  Tredecile: "Bodies 108° apart: a gentle, talented link.",
  Trine: "Bodies 120° apart: a harmonious flow.",
  Undecile: "Bodies about 32.7° apart: a faint, unusual link.",
};

/** What each compound aspect pattern is. */
const PATTERN_NOTES: Readonly<Record<string, string>> = {
  Boomerang: "A yod with a fourth body opposite its apex.",
  Butterfly: "Two bodies opposite, with two more square to them and opposite.",
  Cradle:
    "Four bodies in a row of sextiles and trines, cradling an opposition.",
  "Grand Cross": "Four bodies in squares and oppositions: a tense cross.",
  "Grand Trine": "Three bodies 120° apart: a closed triangle of ease.",
  Hammer: "Two bodies in sextile, both square a third.",
  Hexagram: "Six bodies in two interlocking grand trines, the Star of David.",
  Hourglass: "Two oppositions linked by squares.",
  Kite: "A grand trine with a fourth body opposite one of its points.",
  "Mystic Rectangle": "Two oppositions linked by sextiles and trines.",
  Pentagram: "Five bodies in a star of quintile and biquintile aspects.",
  "T Square": "Two bodies in opposition, both square a third.",
  Yod: "Two bodies in sextile, both quincunx a third.",
};

/** The ordinals of the harmonics. */
const ORDINALS: readonly string[] = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
];

/** What each harmonic divides the circle into. */
const HARMONIC_NOTES: readonly string[] = [
  "the conjunction, a circle undivided",
  "the opposition, a circle in halves",
  "the trine, a circle in thirds",
  "the square, a circle in quarters",
  "the quintile family, a circle in fifths",
  "the sextile, a circle in sixths",
  "the septile family, a circle in sevenths",
  "the semisquare and sesquiquadrate, a circle in eighths",
  "the novile, a circle in ninths",
  "the decile and tredecile, a circle in tenths",
  "the undecile, a circle in elevenths",
  "the semisextile and quincunx, a circle in twelfths",
];

/** What each body is. */
const BODY_NOTES: Readonly<Record<string, string>> = {
  Ceres: "The asteroid of nurture and harvest.",
  Chiron: "The wounded healer, between Saturn and Uranus.",
  Juno: "The asteroid of partnership and commitment.",
  Jupiter: "The planet of growth and good fortune.",
  Lilith: "The Moon's far point, the black moon.",
  "Lunar Apogee": "The point where the Moon is farthest from the Earth.",
  "Lunar Perigee": "The point where the Moon is nearest the Earth.",
  Mars: "The planet of drive and conflict.",
  Mercury: "The planet of mind and messages.",
  Moon: "The Earth's satellite, ruling mood and rhythm.",
  Neptune: "The planet of dreams and dissolution.",
  "North Lunar Node": "Where the Moon crosses the ecliptic heading north.",
  Pallas: "The asteroid of strategy and wisdom.",
  Pluto: "The dwarf planet of transformation.",
  Saturn: "The planet of structure and limits.",
  "South Lunar Node": "Where the Moon crosses the ecliptic heading south.",
  Sun: "The star at the center, ruling identity and vitality.",
  Uranus: "The planet of change and surprise.",
  Venus: "The planet of love and value.",
  Vesta: "The asteroid of devotion and focus.",
};

/** What each phase of a planet's cycle with the Sun is, whichever planet. */
const PHASE_NOTES: Readonly<Record<string, string>> = {
  "Eastern Brightest": "The planet shines brightest in the evening sky.",
  "Eastern Elongation": "The planet stands farthest east of the Sun.",
  "Evening Rise": "The planet rises in the evening.",
  "Evening Set": "The planet sets in the evening.",
  "Evening Star": "The planet shows in the evening sky.",
  "Evening Station": "The planet stops against the stars in the evening sky.",
  "Evening Visibility": "The span the planet is seen in the evening.",
  "Inferior Conjunction": "The planet passes between the Earth and the Sun.",
  "Morning Rise": "The planet rises in the morning.",
  "Morning Set": "The planet sets in the morning.",
  "Morning Star": "The planet shows in the morning sky.",
  "Morning Station": "The planet stops against the stars in the morning sky.",
  "Morning Visibility": "The span the planet is seen in the morning.",
  Opposition: "The planet is opposite the Sun and at its nearest.",
  "Superior Conjunction": "The planet passes behind the Sun.",
  "Western Brightest": "The planet shines brightest in the morning sky.",
  "Western Elongation": "The planet stands farthest west of the Sun.",
};

/** The point of the year each hexadecan marks, in sixteenths of the way round. */
const HEXADECAN_SIXTEENTHS: Readonly<Record<string, number>> = {
  Eleventh: 11,
  Fifteenth: 15,
  Fifth: 5,
  First: 1,
  Ninth: 9,
  Seventh: 7,
  Third: 3,
  Thirteenth: 13,
};

/** The notes of nodes named by their path, for those that are not generated. */
const PATH_NOTES: Readonly<Record<string, string>> = {
  "Daily / Time of Day / Evening": "The twilight falls after the Sun has set.",
  "Daily / Time of Day / Morning": "The twilight falls before the Sun rises.",
  "Daily / Twilight / Astronomical Dawn":
    "The Sun is 18° below the horizon, rising: the sky begins to lighten.",
  "Daily / Twilight / Astronomical Dusk":
    "The Sun is 18° below the horizon, setting: the sky is fully dark.",
  "Daily / Twilight / Astronomical Twilight":
    "The span between 18° and 12° below the horizon.",
  "Daily / Twilight / Civil Dawn":
    "The Sun is 6° below the horizon, rising: light enough to see outdoors.",
  "Daily / Twilight / Civil Dusk":
    "The Sun is 6° below the horizon, setting: lights are needed outdoors.",
  "Daily / Twilight / Daylight": "The Sun is above the horizon.",
  "Daily / Twilight / Nautical Dawn":
    "The Sun is 12° below the horizon, rising: the horizon shows at sea.",
  "Daily / Twilight / Nautical Dusk":
    "The Sun is 12° below the horizon, setting: the sea horizon fades.",
  "Daily / Twilight / Nautical Twilight":
    "The span between 12° and 6° below the horizon.",
  "Daily / Twilight / Night": "The Sun is more than 18° below the horizon.",
  "Eclipse / Lunar / Partial":
    "Only part of the Moon enters the Earth's shadow.",
  "Eclipse / Lunar / Total": "The whole Moon enters the Earth's shadow.",
  "Eclipse / Phase / Beginning": "The eclipse begins.",
  "Eclipse / Phase / Ending": "The eclipse ends.",
  "Eclipse / Phase / Maximum": "The eclipse is at its greatest.",
  "Eclipse / Solar / Annular":
    "The Moon is too far to cover the Sun, leaving a ring.",
  "Eclipse / Solar / Partial": "The Moon covers only part of the Sun.",
  "Eclipse / Solar / Total": "The Moon covers the whole Sun.",
  "Lunar / Monthly Cycle / First Quarter": "Half the Moon is lit, waxing.",
  "Lunar / Monthly Cycle / Full": "The whole face of the Moon is lit.",
  "Lunar / Monthly Cycle / Last Quarter": "Half the Moon is lit, waning.",
  "Lunar / Monthly Cycle / New":
    "The Moon is between the Earth and the Sun, dark.",
  "Lunar / Monthly Cycle / Waning Crescent":
    "A thin crescent, shrinking to new.",
  "Lunar / Monthly Cycle / Waning Gibbous":
    "More than half lit, shrinking from full.",
  "Lunar / Monthly Cycle / Waxing Crescent":
    "A thin crescent, growing from new.",
  "Lunar / Monthly Cycle / Waxing Gibbous":
    "More than half lit, growing to full.",
  "Planetary / Phase / Martian": "Mars's cycle of visibility with the Sun.",
  "Planetary / Phase / Mercurian":
    "Mercury's cycle of visibility with the Sun.",
  "Planetary / Phase / Venusian": "Venus's cycle of visibility with the Sun.",
  "Planetary / Synodic Stage / Brightest":
    "The planet shines at its brightest.",
  "Planetary / Synodic Stage / Conjunction":
    "The planet lines up with the Sun.",
  "Planetary / Synodic Stage / Elongation":
    "The planet stands farthest from the Sun.",
  "Planetary / Synodic Stage / Opposition": "The planet is opposite the Sun.",
  "Planetary / Synodic Stage / Rise and set":
    "The planet rises or sets with the Sun's light.",
  "Planetary / Synodic Stage / Station": "The planet stops against the stars.",
  "Planetary / Synodic Stage / Visibility":
    "The span the planet is seen at one end of the day.",
  "Solar / Annual Cycle / Advancing": "The Sun's days are growing longer.",
  "Solar / Annual Cycle / Aphelion": "The Earth is farthest from the Sun.",
  "Solar / Annual Cycle / Cross-Quarter Day / Beltane":
    "Midway from the spring equinox to the summer solstice.",
  "Solar / Annual Cycle / Cross-Quarter Day / Imbolc":
    "Midway from the winter solstice to the spring equinox.",
  "Solar / Annual Cycle / Cross-Quarter Day / Lammas":
    "Midway from the summer solstice to the autumn equinox.",
  "Solar / Annual Cycle / Cross-Quarter Day / Samhain":
    "Midway from the autumn equinox to the winter solstice.",
  "Solar / Annual Cycle / Equinox / Autumnal Equinox":
    "Day and night are equal, as the year turns toward winter.",
  "Solar / Annual Cycle / Equinox / Vernal Equinox":
    "Day and night are equal, as the year turns toward summer.",
  "Solar / Annual Cycle / Perihelion": "The Earth is nearest the Sun.",
  "Solar / Annual Cycle / Retreating": "The Sun's days are growing shorter.",
  "Solar / Annual Cycle / Solstice / Summer Solstice":
    "The longest day of the year.",
  "Solar / Annual Cycle / Solstice / Winter Solstice":
    "The shortest day of the year.",
  "Solar / Season / Autumn":
    "The season from the autumn equinox to the winter solstice.",
  "Solar / Season / Spring":
    "The season from the spring equinox to the summer solstice.",
  "Solar / Season / Summer":
    "The season from the summer solstice to the autumn equinox.",
  "Solar / Season / Winter":
    "The season from the winter solstice to the spring equinox.",
  "Zodiac / Decan / First Decan": "The first ten degrees of a sign.",
  "Zodiac / Decan / Second Decan": "The middle ten degrees of a sign.",
  "Zodiac / Decan / Third Decan": "The last ten degrees of a sign.",
  "Zodiac / Dignity / Detriment":
    "The planet sits opposite its home sign: weak.",
  "Zodiac / Dignity / Domicile": "The planet sits in its home sign: strong.",
  "Zodiac / Dignity / Exaltation":
    "The planet sits in the sign where it is honored.",
  "Zodiac / Dignity / Fall":
    "The planet sits opposite its exaltation: lowered.",
  "Zodiac / Dignity / Peregrine":
    "The planet holds no dignity or debility in the sign.",
  "Zodiac / Ingress / Decan Ingress": "A body enters a new decan of a sign.",
  "Zodiac / Ingress / Peak Ingress": "A body reaches the midpoint of a sign.",
  "Zodiac / Ingress / Sign Ingress": "A body enters a new sign, an instant.",
  "Zodiac / Ingress / Sign Transit": "A body's stay in one sign, a span.",
  "Zodiac / Modality / Cardinal":
    "Signs that start a season: Aries, Cancer, Libra, Capricorn.",
  "Zodiac / Modality / Fixed":
    "Signs in the middle of a season: Taurus, Leo, Scorpio, Aquarius.",
  "Zodiac / Modality / Mutable":
    "Signs that end a season: Gemini, Virgo, Sagittarius, Pisces.",
  "Zodiac / Polarity / Negative": "Earth and water signs: receptive.",
  "Zodiac / Polarity / Positive": "Fire and air signs: outward.",
};

/**
 * The note of every tag leaf that has no entry in the tag metadata, by its path joined with ` / `: aspects, patterns, harmonics, bodies and signs by name, then the rest by path.
 */
export const TAG_NOTES: Readonly<Record<string, string>> = {
  ...PATH_NOTES,
  ...Object.fromEntries(
    Object.entries(ASPECT_NOTES).flatMap(([name, note]) =>
      ["Major", "Minor", "Specialty"].map(
        (kind) => [`Aspect / Simple / ${kind} / ${name}`, note] as const,
      ),
    ),
  ),
  ...Object.fromEntries(
    Object.entries(PATTERN_NOTES).flatMap(([name, note]) =>
      ["Triple", "Quadruple", "Quintuple", "Sextuple"].map(
        (kind) => [`Aspect / Compound / ${kind} / ${name}`, note] as const,
      ),
    ),
  ),
  ...Object.fromEntries(
    Object.entries(HEXADECAN_SIXTEENTHS).map(
      ([name, sixteenths]) =>
        [
          `Solar / Annual Cycle / Hexadecan / ${name} Hexadecan`,
          `The point ${String(sixteenths)}/16 of the way round the year.`,
        ] as const,
    ),
  ),
  ...Object.fromEntries(
    HARMONIC_NOTES.map(
      (note, index) =>
        [
          `Aspect / Harmonic / Harmonic ${String(index + 1)}`,
          `The aspects of the ${ORDINALS[index] ?? ""} harmonic: ${note}.`,
        ] as const,
    ),
  ),
  ...Object.fromEntries(
    Array.from(
      { length: 12 },
      (_value, index) =>
        [
          `Aspect / Compound / Stellium / ${String(index + 3)} Body`,
          `${String(index + 3)} bodies bunched together in one place.`,
        ] as const,
    ),
  ),
  ...Object.fromEntries(
    Object.entries(BODY_NOTES).flatMap(([name, note]) => [
      [
        `Aspect / Focal Body / ${name} Focal`,
        `The pattern points at ${name}.`,
      ] as const,
      ...[
        "Asteroid",
        "Luminary",
        "Node",
        "Planet / Outer",
        "Planet / Personal",
        "Planet / Social",
        "Point",
      ].map((bodyClass) => [`Body / ${bodyClass} / ${name}`, note] as const),
    ]),
  ),
  ...Object.fromEntries(
    ["Martian", "Mercurian", "Venusian"].flatMap((marker) =>
      Object.entries(PHASE_NOTES).map(
        ([phase, note]) =>
          [`Planetary / Phase / ${marker} / ${phase}`, note] as const,
      ),
    ),
  ),
  ...Object.fromEntries(
    Object.entries(ELEMENT_BY_SIGN).map(([sign, element]) => {
      const name = `${sign.charAt(0).toUpperCase()}${sign.slice(1)}`;
      return [
        `Zodiac / Sign / ${name}`,
        `The sign of ${SIGN_FIGURES[sign] ?? ""}, a ${(MODALITIES[sign] ?? "").toLowerCase()} ${element.toLowerCase()} sign.`,
      ] as const;
    }),
  ),
};
