import _ from "lodash";
import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import { aspects } from "../caelundas/caelundas.constants";

import { classifyEvent, tagNodeKey, tagPathKey } from "./tags.utilities";

import type { TagPath } from "./tags.types";

const AT = "2026-03-20T12:00:00Z";
const LATER = "2026-03-21T12:00:00Z";

/** The paths an event with these raw tags is classified under. */
function classify(tags: string[], end = AT): TagPath[] {
  return classifyEvent({ end: moment.utc(end), start: moment.utc(AT), tags });
}

/** The paths under one root, or under the `Type` root by default. */
function under(paths: readonly TagPath[], root = "Type"): TagPath[] {
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

    it("types a simple aspect by its class and name, under Aspect", () => {
      const paths = classify([
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Major Aspect",
        "Mars",
        "Venus",
        "Conjunct",
      ]);

      expect(under(paths)).toStrictEqual([
        ["Type", "Aspect", "Simple Aspect", "Major Aspect", "Conjunct"],
      ]);
      expect(under(paths, "Planet")).toStrictEqual([
        ["Planet", "Mars"],
        ["Planet", "Venus"],
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

      expect(under(paths)).toStrictEqual([
        ["Type", "Aspect", "Compound Aspect", "Triple Aspect", "T Square"],
      ]);
      expect(under(paths, "Focal Body")).toStrictEqual([
        ["Focal Body", "Mercury Focal"],
      ]);
    });

    it("types a stellium by its number of bodies", () => {
      expect(
        under(classify(["Compound Aspect", "Stellium", "4 Body", "Sun"])),
      ).toStrictEqual([
        ["Type", "Aspect", "Compound Aspect", "Stellium", "4 Body"],
      ]);
    });

    it("tags a body's sign beside the body, as separate roots", () => {
      const paths = classify(["Ingress", "Mars", "Aries"]);

      expect(under(paths, "Planet")).toStrictEqual([["Planet", "Mars"]]);
      expect(under(paths, "Sign")).toStrictEqual([["Sign", "Aries"]]);
    });

    it.each([
      ["Aries", "Fire", "Cardinal", "Positive"],
      ["Taurus", "Earth", "Fixed", "Negative"],
      ["Gemini", "Air", "Mutable", "Positive"],
      ["Cancer", "Water", "Cardinal", "Negative"],
    ])(
      "implies %s's element, modality and polarity as roots of their own",
      (sign, element, modality, polarity) => {
        const paths = classify(["Ingress", "Sun", sign]);

        expect(under(paths, "Sign")).toStrictEqual([["Sign", sign]]);
        expect(under(paths, "Element")).toStrictEqual([["Element", element]]);
        expect(under(paths, "Modality")).toStrictEqual([
          ["Modality", modality],
        ]);
        expect(under(paths, "Polarity")).toStrictEqual([
          ["Polarity", polarity],
        ]);
      },
    );

    it.each([
      ["Sun", "Luminary"],
      ["Mercury", "Personal"],
      ["Saturn", "Social"],
      ["Pluto", "Outer"],
      ["Chiron", "Asteroid"],
      ["North Lunar Node", "Node"],
      ["Lunar Apogee", "Point"],
    ])("classes %s as a %s body", (body, bodyClass) => {
      expect(
        under(classify(["Ingress", body, "Leo"]), "Body Class"),
      ).toStrictEqual([["Body Class", bodyClass]]);
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

      expect(under(paths, "Aspect Nature")).toStrictEqual([
        ["Aspect Nature", nature],
      ]);
      expect(under(paths, "Aspect Harmonic")).toStrictEqual([
        ["Aspect Harmonic", harmonic],
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

        expect(under(paths, "Aspect Nature")).toStrictEqual([
          ["Aspect Nature", nature],
        ]);
        expect(under(paths, "Aspect Harmonic")).toStrictEqual([
          ["Aspect Harmonic", harmonic],
        ]);
      },
    );

    it("gives every simple aspect a nature and a harmonic", () => {
      const unclassified = aspects
        .map((aspect) => _.startCase(aspect))
        .filter((aspect) => {
          const roots = new Set(
            classify(["Simple Aspect", aspect]).map(([root]) => root),
          );
          return !roots.has("Aspect Nature") || !roots.has("Aspect Harmonic");
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
        under(classify(["Ingress", planet, sign]), "Dignity"),
      ).toStrictEqual([["Dignity", dignity]]);
    });

    it("gives each ingress of a traditional planet one dignity", () => {
      const counts = ["Moon", "Venus", "Mars", "Jupiter"].flatMap((planet) =>
        ["Aries", "Cancer", "Libra", "Capricorn"].map(
          (sign) =>
            under(classify(["Ingress", planet, sign]), "Dignity").length,
        ),
      );

      expect(new Set(counts)).toStrictEqual(new Set([1]));
    });

    it.each([
      [["Ingress", "Uranus", "Leo"]],
      [["Simple Aspect", "Sun", "Leo"]],
    ])("gives %j no dignity", (tags) => {
      expect(under(classify(tags), "Dignity")).toStrictEqual([]);
    });

    it.each([
      ["Venusian", "Venus", "Western Elongation", "Elongation"],
      ["Venusian", "Venus", "Inferior Conjunction", "Conjunction"],
      ["Mercurian", "Mercury", "Eastern Brightest", "Brightest"],
      ["Mercurian", "Mercury", "Morning Rise", "Rise and set"],
      ["Martian", "Mars", "Evening Station", "Station"],
      ["Martian", "Mars", "Morning Visibility", "Visibility"],
    ])(
      "types a %s %s event under Planetary Phase, with its planet and the %s stage",
      (marker, planet, phase, stage) => {
        const paths = classify([
          "Astronomy",
          "Astrology",
          "Planetary Phase",
          marker,
          phase,
        ]);

        expect(under(paths)).toStrictEqual([
          ["Type", "Planetary Phase", marker, phase],
        ]);
        expect(under(paths, "Planet")).toStrictEqual([["Planet", planet]]);
        expect(under(paths, "Synodic Stage")).toStrictEqual([
          ["Synodic Stage", stage],
        ]);
        expect(under(paths, "Domain")).toStrictEqual([["Domain", "Planetary"]]);
      },
    );

    it("keeps a planetary phase named like a lunar phase out of Lunar Phase", () => {
      const paths = classify(["Planetary Phase", "Venusian", "Full"]);

      expect(under(paths, "Lunar Phase")).toStrictEqual([]);
      expect(under(paths, "Synodic Stage")).toStrictEqual([
        ["Synodic Stage", "Conjunction"],
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

      expect(under(paths, "Decan")).toStrictEqual([["Decan", "Second Decan"]]);
    });

    it.each([
      [["Ingress", "Mars", "Aries"], AT, "Sign Ingress"],
      [["Ingress", "Mars", "Aries"], LATER, "Sign Transit"],
      [["Ingress", "Decan", "Mars", "Aries"], AT, "Decan Ingress"],
      [["Ingress", "Peak", "Mars", "Aries"], AT, "Peak Ingress"],
    ])("types %j ending at %s as a %s", (tags, end, kind) => {
      expect(under(classify(tags, end))).toStrictEqual([
        ["Type", "Ingress", kind],
      ]);
    });

    it("types an eclipse by the body eclipsed and its type", () => {
      const paths = classify(["Eclipse", "Lunar", "Geocentric", "Total"]);

      expect(under(paths)).toStrictEqual([
        ["Type", "Eclipse", "Lunar Eclipse", "Total Lunar Eclipse"],
      ]);
      expect(under(paths, "Eclipse Frame")).toStrictEqual([
        ["Eclipse Frame", "Geocentric"],
      ]);
    });

    it("types an eclipse span without a type by its body alone", () => {
      expect(
        under(classify(["Eclipse", "Solar", "Topocentric Visibility"], LATER)),
      ).toStrictEqual([["Type", "Eclipse", "Solar Eclipse"]]);
    });

    it.each([
      [["Retrogrades"], ["Type", "Retrograde Period"]],
      [
        ["Direction", "Retrograde"],
        ["Type", "Station"],
      ],
      [
        ["Twilight", "Civil Dawn"],
        ["Type", "Twilight", "Civil Dawn"],
      ],
      [
        ["Daily Solar Cycle", "Solar"],
        ["Type", "Cycle", "Daily Solar Cycle"],
      ],
      [
        ["Lunar Apsides", "Lunar", "Apogee"],
        ["Type", "Cycle", "Lunar Apsides", "Apogee"],
      ],
      [
        ["Annual Solar Cycle", "Solar", "Perihelion"],
        ["Type", "Cycle", "Annual Solar Cycle", "Perihelion"],
      ],
    ])("types %j as %j", (tags, path) => {
      expect(under(classify(tags))).toStrictEqual([path]);
    });

    it.each([
      [AT, "Instant"],
      [LATER, "Duration"],
    ])("tags an event ending at %s as an %s", (end, temporality) => {
      expect(
        under(classify(["Twilight", "Night"], end), "Temporality"),
      ).toStrictEqual([["Temporality", temporality]]);
    });

    it.each([
      [["Simple Aspect", "Trine", "Forming"], "Forming"],
      [["Compound Aspect", "Kite", "Perfective"], "Perfective"],
      [["Eclipse", "Solar", "Annular", "Geocentric", "Beginning"], "Beginning"],
      [["Eclipse", "Lunar", "Total", "Geocentric", "Maximum"], "Maximum"],
    ])("puts %j under the %s phase", (tags, phase) => {
      expect(under(classify(tags), "Phase")).toStrictEqual([["Phase", phase]]);
    });

    it.each([
      [["Retrogrades", "Mars"], LATER, "Retrograde"],
      [["Direction", "Mars", "Retrograde"], AT, "Station Retrograde"],
      [["Direction", "Mars", "Direct"], AT, "Station Direct"],
    ])("gives %j ending at %s the %s motion", (tags, end, motion) => {
      expect(under(classify(tags, end), "Motion")).toStrictEqual([
        ["Motion", motion],
      ]);
    });

    it.each([
      [
        ["Monthly Lunar Cycle", "Lunar", "Waxing Gibbous"],
        "Lunar Phase",
        "Waxing Gibbous",
      ],
      [["Annual Solar Cycle", "Solar", "Beltane"], "Season", "Spring"],
      [["Annual Solar Cycle", "Solar", "Winter Solstice"], "Season", "Winter"],
      [["Daily Solar Cycle", "Solar"], "Domain", "Solar"],
      [["Lunar Apsides", "Lunar", "Perigee"], "Domain", "Lunar"],
      [["Retrogrades", "Venus"], "Domain", "Planetary"],
      [["Direction", "Venus", "Direct"], "Domain", "Planetary"],
    ])("tags %j with the %s %s", (tags, root, name) => {
      expect(under(classify(tags), root)).toStrictEqual([[root, name]]);
    });

    it("types a point of the solar cycle by its kind", () => {
      expect(
        under(classify(["Annual Solar Cycle", "Solar", "Vernal Equinox"])),
      ).toStrictEqual([
        ["Type", "Cycle", "Annual Solar Cycle", "Equinox", "Vernal Equinox"],
      ]);
    });

    it("keeps only the deepest node of each branch, each once", () => {
      const paths = classify(["Twilight", "Night", "Night", "Twilight"]);

      expect(paths).toStrictEqual([
        ["Temporality", "Instant"],
        ["Type", "Twilight", "Night"],
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
      expect(tagPathKey(["Type", "Aspect"])).not.toBe(
        tagPathKey(["Type Aspect"]),
      );
    });
  });
});
