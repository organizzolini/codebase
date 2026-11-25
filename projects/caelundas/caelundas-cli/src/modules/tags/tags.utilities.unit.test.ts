import _ from "lodash";
import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import { aspects } from "../caelundas/caelundas.constants";

import {
  classifyEvent,
  tagNodeKey,
  tagPathKey,
  tagRank,
} from "./tags.utilities";

import type { TagPath } from "./tags.types";

const AT = "2026-03-20T12:00:00Z";
const LATER = "2026-03-21T12:00:00Z";

/** The paths an event with these raw tags is classified under. */
function classify(tags: string[], end = AT): TagPath[] {
  return classifyEvent({ end: moment.utc(end), start: moment.utc(AT), tags });
}

/** The harmonic paths, which sit under Aspect. */
function harmonics(paths: readonly TagPath[]): TagPath[] {
  return paths.filter(
    ([root, branch]) => root === "Aspect" && branch === "Harmonic",
  );
}

/** The paths under one root. */
function under(paths: readonly TagPath[], root: string): TagPath[] {
  return paths.filter(([first]) => first === root);
}

describe("tags utilities", () => {
  describe(classifyEvent, () => {
    it("falls back to a root named for an unmapped raw tag", () => {
      expect(classify(["moon phase"])).toContainEqual(["moon phase"]);
    });

    it("drops the raw tags every event carries", () => {
      const roots = classify(["Astronomy", "Astrology"]).map(([root]) => root);

      expect(roots).not.toContain("Astronomy");
      expect(roots).not.toContain("Astrology");
    });

    it("files a simple aspect by its class and name, under Aspect", () => {
      const paths = classify([
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Major Aspect",
        "Mars",
        "Venus",
        "Conjunct",
      ]);

      expect(under(paths, "Aspect")).toStrictEqual([
        ["Aspect", "Harmonic", "Harmonic 1"],
        ["Aspect", "Nature", "Neutral"],
        ["Aspect", "Simple", "Major", "Conjunct"],
      ]);
      expect(under(paths, "Body")).toStrictEqual([
        ["Body", "Planet", "Personal", "Mars"],
        ["Body", "Planet", "Personal", "Venus"],
      ]);
    });

    it("nests a compound aspect pattern under its class, with its focal body", () => {
      const paths = classify([
        "Compound Aspect",
        "Triple Aspect",
        "T Square",
        "Forming",
        "Moon",
        "Lilith",
        "Mercury",
        "Mercury Focal",
      ]);

      expect(under(paths, "Aspect")).toStrictEqual([
        ["Aspect", "Compound", "Triple", "T Square"],
        ["Aspect", "Focal Body", "Mercury Focal"],
        ["Aspect", "Harmonic", "Harmonic 4"],
        ["Aspect", "Nature", "Hard"],
        ["Aspect", "Phase", "Forming"],
      ]);
    });

    it("files a stellium by its number of bodies", () => {
      expect(
        under(
          classify(["Compound Aspect", "Stellium", "4 Body", "Sun"]),
          "Aspect",
        ),
      ).toContainEqual(["Aspect", "Compound", "Stellium", "4 Body"]);
    });

    it("tags a body's sign beside the body, in separate roots", () => {
      const paths = classify(["Ingress", "Mars", "Aries"]);

      expect(under(paths, "Body")).toStrictEqual([
        ["Body", "Planet", "Personal", "Mars"],
      ]);
      expect(under(paths, "Zodiac")).toContainEqual([
        "Zodiac",
        "Sign",
        "Aries",
      ]);
    });

    it.each([
      ["Aries", "Fire", "Cardinal", "Positive"],
      ["Taurus", "Earth", "Fixed", "Negative"],
      ["Gemini", "Air", "Mutable", "Positive"],
      ["Cancer", "Water", "Cardinal", "Negative"],
    ])(
      "implies %s's element, modality and polarity in the zodiac",
      (sign, element, modality, polarity) => {
        const paths = under(classify(["Ingress", "Sun", sign]), "Zodiac");

        expect(paths).toContainEqual(["Zodiac", "Sign", sign]);
        expect(paths).toContainEqual(["Zodiac", "Element", element]);
        expect(paths).toContainEqual(["Zodiac", "Modality", modality]);
        expect(paths).toContainEqual(["Zodiac", "Polarity", polarity]);
      },
    );

    it.each([
      ["Sun", "Luminary"],
      ["Mercury", "Planet", "Personal"],
      ["Saturn", "Planet", "Social"],
      ["Pluto", "Planet", "Outer"],
      ["Chiron", "Asteroid"],
      ["North Lunar Node", "Point"],
      ["Lunar Apogee", "Point"],
    ])("classes %s as a %s body", (body, ...bodyClass) => {
      expect(under(classify(["Ingress", body, "Leo"]), "Body")).toStrictEqual([
        ["Body", ...bodyClass, body],
      ]);
    });

    it.each([
      ["Conjunct", "Neutral", "Harmonic 1"],
      ["Opposite", "Hard", "Harmonic 2"],
      ["Trine", "Soft", "Harmonic 3"],
      ["Square", "Hard", "Harmonic 4"],
      ["Quincunx", "Neutral", "Harmonic 12"],
      ["Septile", "Neutral", "Harmonic 7"],
    ])("gives a %s its %s nature and its %s", (aspect, nature, harmonic) => {
      const paths = classify(["Simple Aspect", "Sun", "Moon", aspect]);

      expect(under(paths, "Aspect")).toContainEqual([
        "Aspect",
        "Nature",
        nature,
      ]);
      expect(harmonics(paths)).toStrictEqual([
        ["Aspect", "Harmonic", harmonic],
      ]);
    });

    it.each([
      [["Triple Aspect", "T Square"], "Hard", "Harmonic 4"],
      [["Triple Aspect", "Grand Trine"], "Soft", "Harmonic 3"],
      [["Triple Aspect", "Yod"], "Neutral", "Harmonic 12"],
      [["Quadruple Aspect", "Kite"], "Soft", "Harmonic 6"],
      [["Stellium", "5 Body"], "Neutral", "Harmonic 1"],
    ])(
      "gives the pattern %j its %s nature and its %s",
      (tags, nature, harmonic) => {
        const paths = classify(["Compound Aspect", ...tags, "Sun", "Moon"]);

        expect(under(paths, "Aspect")).toContainEqual([
          "Aspect",
          "Nature",
          nature,
        ]);
        expect(harmonics(paths)).toStrictEqual([
          ["Aspect", "Harmonic", harmonic],
        ]);
      },
    );

    it("gives every simple aspect a nature and a harmonic", () => {
      const unclassified = aspects
        .map((aspect) => _.startCase(aspect))
        .filter((aspect) => {
          const paths = classify(["Simple Aspect", aspect]);
          return (
            !under(paths, "Aspect").some(([, branch]) => branch === "Nature") ||
            harmonics(paths).length === 0
          );
        });

      expect(unclassified).toStrictEqual([]);
    });

    it.each([
      ["Sun", "Leo", "Domicile"],
      ["Sun", "Aries", "Exaltation"],
      ["Sun", "Aquarius", "Detriment"],
      ["Sun", "Libra", "Fall"],
      ["Sun", "Gemini", "Peregrine"],
      ["Mercury", "Virgo", "Domicile"],
      ["Mercury", "Pisces", "Detriment"],
      ["Saturn", "Aries", "Fall"],
    ])("gives %s's ingress into %s the %s dignity", (planet, sign, dignity) => {
      expect(
        under(classify(["Ingress", planet, sign]), "Zodiac"),
      ).toContainEqual(["Zodiac", "Dignity", dignity]);
    });

    it("gives each ingress of a traditional planet one dignity", () => {
      const counts = ["Moon", "Venus", "Mars", "Jupiter"].flatMap((planet) =>
        ["Aries", "Cancer", "Libra", "Capricorn"].map(
          (sign) =>
            under(classify(["Ingress", planet, sign]), "Zodiac").filter(
              ([, branch]) => branch === "Dignity",
            ).length,
        ),
      );

      expect(new Set(counts)).toStrictEqual(new Set([1]));
    });

    it.each([
      [["Ingress", "Uranus", "Leo"]],
      [["Simple Aspect", "Sun", "Leo"]],
    ])("gives %j no dignity", (tags) => {
      expect(
        under(classify(tags), "Zodiac").filter(
          ([, branch]) => branch === "Dignity",
        ),
      ).toStrictEqual([]);
    });

    it.each([
      ["Venusian", "Venus", "Western Elongation", "Elongation"],
      ["Venusian", "Venus", "Inferior Conjunction", "Conjunction"],
      ["Mercurian", "Mercury", "Eastern Brightest", "Brightest"],
      ["Mercurian", "Mercury", "Morning Rise", "Rise and set"],
      ["Martian", "Mars", "Evening Station", "Station"],
      ["Martian", "Mars", "Morning Visibility", "Visibility"],
    ])(
      "files a %s %s event under Planetary Phase, with its planet and the %s stage",
      (marker, planet, phase, stage) => {
        const paths = classify([
          "Astronomy",
          "Astrology",
          "Planetary Phase",
          marker,
          phase,
        ]);

        expect(under(paths, "Planetary")).toStrictEqual([
          ["Planetary", "Phase", marker, phase],
          ["Planetary", "Synodic Stage", stage],
        ]);
        expect(under(paths, "Body")).toStrictEqual([
          ["Body", "Planet", "Personal", planet],
        ]);
      },
    );

    it("keeps a planetary phase named like a lunar phase out of the Moon's", () => {
      const paths = classify(["Planetary Phase", "Venusian", "Full"]);

      expect(under(paths, "Lunar")).toStrictEqual([]);
      expect(under(paths, "Planetary")).toContainEqual([
        "Planetary",
        "Synodic Stage",
        "Conjunction",
      ]);
    });

    it("tags a decan ingress with the decan it enters", () => {
      const paths = classify([
        "Ingress",
        "Decan",
        "Second Decan",
        "Sun",
        "Leo",
      ]);

      expect(under(paths, "Zodiac")).toContainEqual([
        "Zodiac",
        "Decan",
        "Second Decan",
      ]);
    });

    it.each([
      [["Ingress", "Mars", "Aries"], AT, "Sign Ingress"],
      [["Ingress", "Mars", "Aries"], LATER, "Sign Transit"],
      [["Ingress", "Decan", "Mars", "Aries"], AT, "Decan Ingress"],
      [["Ingress", "Peak", "Mars", "Aries"], AT, "Peak Ingress"],
    ])("files %j ending at %s as a %s", (tags, end, kind) => {
      expect(under(classify(tags, end), "Zodiac")).toContainEqual([
        "Zodiac",
        "Ingress",
        kind,
      ]);
    });

    it("files an eclipse by the body eclipsed and its type", () => {
      const paths = under(
        classify(["Eclipse", "Lunar", "Geocentric", "Total"]),
        "Eclipse",
      );

      expect(paths).toStrictEqual([
        ["Eclipse", "Frame", "Geocentric"],
        ["Eclipse", "Lunar", "Total"],
      ]);
    });

    it("files an eclipse span without a type by its body alone", () => {
      expect(
        under(
          classify(["Eclipse", "Solar", "Topocentric Visibility"], LATER),
          "Eclipse",
        ),
      ).toContainEqual(["Eclipse", "Solar"]);
    });

    it.each([
      [["Retrogrades"], ["Planetary", "Direction", "Retrograde Period"]],
      [
        ["Direction", "Retrograde"],
        ["Planetary", "Direction", "Station Retrograde"],
      ],
      [
        ["Direction", "Direct"],
        ["Planetary", "Direction", "Station Direct"],
      ],
      [
        ["Twilight", "Civil Dawn"],
        ["Daily", "Twilight", "Civil Dawn"],
      ],
      [
        ["Daily Solar Cycle", "Solar"],
        ["Daily", "Solar Cycle"],
      ],
      [
        ["Daily Lunar Cycle", "Lunar"],
        ["Daily", "Lunar Cycle"],
      ],
      [
        ["Daily Solar Cycle", "Solar", "Sunrise"],
        ["Daily", "Solar Cycle", "Rise"],
      ],
      [
        ["Daily Solar Cycle", "Solar", "Sunset"],
        ["Daily", "Solar Cycle", "Set"],
      ],
      [
        ["Daily Solar Cycle", "Solar", "Solar Zenith"],
        ["Daily", "Solar Cycle", "Zenith"],
      ],
      [
        ["Daily Solar Cycle", "Solar", "Solar Nadir"],
        ["Daily", "Solar Cycle", "Nadir"],
      ],
      [
        ["Daily Lunar Cycle", "Lunar", "Moonrise"],
        ["Daily", "Lunar Cycle", "Rise"],
      ],
      [
        ["Daily Lunar Cycle", "Lunar", "Moonset"],
        ["Daily", "Lunar Cycle", "Set"],
      ],
      [
        ["Daily Lunar Cycle", "Lunar", "Lunar Zenith"],
        ["Daily", "Lunar Cycle", "Zenith"],
      ],
      [
        ["Daily Lunar Cycle", "Lunar", "Lunar Nadir"],
        ["Daily", "Lunar Cycle", "Nadir"],
      ],
      [
        ["Lunar Apsides", "Lunar", "Apogee"],
        ["Lunar", "Apsides", "Apogee"],
      ],
      [
        ["Annual Solar Cycle", "Solar", "Perihelion"],
        ["Solar", "Annual Cycle", "Perihelion"],
      ],
      [
        ["Monthly Lunar Cycle", "Lunar", "Waxing Gibbous"],
        ["Lunar", "Monthly Cycle", "Waxing Gibbous"],
      ],
    ])("files %j as %j", (tags, path) => {
      expect(under(classify(tags), path[0] ?? "")).toContainEqual(path);
    });

    it.each([
      [["Retrogrades", "Mars"], LATER, "Planetary"],
      [["Twilight", "Night"], AT, "Daily"],
    ])(
      "keeps the sphere of %j in its root, with no Domain tag",
      (tags, end, root) => {
        const roots = classify(tags, end).map(([first]) => first);

        expect(roots).toContain(root);
        expect(roots).not.toContain("Domain");
      },
    );

    it.each([
      [AT, "Perfective"],
      [LATER, "Progressive"],
    ])("tags an event ending at %s as %s", (end, temporality) => {
      expect(
        under(classify(["Twilight", "Night"], end), "Temporality"),
      ).toStrictEqual([["Temporality", temporality]]);
    });

    it.each([
      [["Simple Aspect", "Trine", "Forming"], "Aspect", "Forming"],
      [["Compound Aspect", "Kite", "Perfective"], "Aspect", "Exact"],
      [
        ["Eclipse", "Solar", "Annular", "Geocentric", "Beginning"],
        "Eclipse",
        "Beginning",
      ],
      [
        ["Eclipse", "Lunar", "Total", "Geocentric", "Maximum"],
        "Eclipse",
        "Maximum",
      ],
    ])("puts %j under the %s phase %s", (tags, root, phase) => {
      expect(under(classify(tags), root)).toContainEqual([
        root,
        "Phase",
        phase,
      ]);
    });

    it.each([
      [["Annual Solar Cycle", "Solar", "Beltane"], "Spring"],
      [["Annual Solar Cycle", "Solar", "Winter Solstice"], "Winter"],
    ])("tags %j with the %s season", (tags, season) => {
      expect(under(classify(tags), "Solar")).toContainEqual([
        "Solar",
        "Season",
        season,
      ]);
    });

    it("files a point of the solar cycle by its kind", () => {
      expect(
        under(
          classify(["Annual Solar Cycle", "Solar", "Vernal Equinox"]),
          "Solar",
        ),
      ).toContainEqual(["Solar", "Annual Cycle", "Equinox", "Vernal Equinox"]);
    });

    it("keeps only the deepest node of each branch, each once", () => {
      const paths = classify(["Twilight", "Night", "Night", "Twilight"]);

      expect(paths).toStrictEqual([
        ["Daily", "Twilight", "Night"],
        ["Temporality", "Perfective"],
      ]);
    });
  });

  describe(tagNodeKey, () => {
    it("tells a root from a child of the same name", () => {
      expect(tagNodeKey(null, "Mars")).not.toBe(tagNodeKey("parent", "Mars"));
    });

    it("tells apart children of different parents", () => {
      expect(tagNodeKey("planet", "Mars")).not.toBe(tagNodeKey("sign", "Mars"));
    });
  });

  describe(tagPathKey, () => {
    it("tells apart paths whose names join alike", () => {
      expect(tagPathKey(["Zodiac", "Sign"])).not.toBe(
        tagPathKey(["Zodiac Sign"]),
      );
    });
  });

  describe(tagRank, () => {
    it.each([
      [["Aspect"], 1],
      [["Temporality"], 9],
      [["Zodiac", "Sign", "Aries"], 1],
      [["Zodiac", "Sign", "Pisces"], 12],
      [["Body", "Luminary", "Moon"], 2],
      [["Daily", "Solar Cycle", "Nadir"], 4],
    ])("places %j at %i among its siblings", (path, rank) => {
      expect(tagRank(path)).toBe(rank);
    });

    it("gives a node its parent's list does not name 0", () => {
      expect(tagRank(["Aspect", "Harmonic", "Harmonic 4"])).toBe(0);
      expect(tagRank(["Unknown"])).toBe(0);
    });
  });
});
