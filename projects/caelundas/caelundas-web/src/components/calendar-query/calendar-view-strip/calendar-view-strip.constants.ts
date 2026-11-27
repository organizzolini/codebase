import type { ViewDefinition } from "./calendar-view-strip.types";

// ♟️ Constants

export const TITLE = "View";

export const ALL_EVENTS_ID = "all-events";

export const CUSTOM_ID = "custom";

/** A chip styled like the buttons beside it. */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";

/** The icon of the chip while the link matches no view. */
export const CUSTOM_VIEW_ICON = "pencil-ruler";

/** The views, in menu order. */
export const VIEWS: readonly ViewDefinition[] = [
  {
    description: "Which sign each body is in: sign ingresses and transits.",
    filter: [{ paths: ["Sign"], root: "Sign" }],
    group: [{ path: "Sign", root: "Sign" }, { root: "Body" }],
    icon: "stars",
    id: "body-signs",
    name: "Body Signs",
    sort: [{ path: "Sign", root: "Sign" }, { root: "Body" }],
  },
  {
    description:
      "Conjunctions, sextiles, squares, trines and oppositions, by kind.",
    filter: [{ paths: ["Simple / Major"], root: "Aspect" }],
    group: [{ path: "Simple / Major", root: "Aspect" }],
    icon: "triangle",
    id: "major-aspects",
    name: "Major Aspects",
    sort: [{ path: "Simple / Major", root: "Aspect" }],
  },
  {
    description:
      "Stations retrograde and direct, and the retrograde periods between.",
    filter: [{ paths: ["Direction"], root: "Planetary" }],
    group: [{ path: "Direction", root: "Planetary" }],
    icon: "undo-2",
    id: "retrogrades",
    name: "Retrogrades",
    sort: [{ path: "Direction", root: "Planetary" }],
  },
  {
    description: "The Sun's and Moon's days: rises, sets, and the twilights.",
    filter: [
      { paths: ["Solar Cycle", "Lunar Cycle", "Twilight"], root: "Daily" },
    ],
    group: [{ root: "Daily" }],
    icon: "sunrise",
    id: "daily-cycles",
    name: "Daily Cycles",
    sort: [{ root: "Daily" }],
  },
  {
    description: "The eight phases of the Moon, new to waning crescent.",
    filter: [{ paths: ["Monthly Cycle"], root: "Lunar" }],
    group: [{ path: "Monthly Cycle", root: "Lunar" }],
    icon: "moon",
    id: "lunar-phases",
    name: "Lunar Phases",
    sort: [{ path: "Monthly Cycle", root: "Lunar" }],
  },
  {
    description:
      "The planets' phases and synodic stages: elongations, brightest, visibility.",
    filter: [{ paths: ["Phase", "Synodic Stage"], root: "Planetary" }],
    group: [{ root: "Planetary" }],
    icon: "refresh-cw",
    id: "planetary-cycles",
    name: "Planetary Cycles",
    sort: [{ root: "Planetary" }],
  },
  {
    description: "Solar and lunar eclipses, by kind, frame and phase.",
    filter: [{ paths: ["Solar", "Lunar"], root: "Eclipse" }],
    group: [{ root: "Eclipse" }],
    icon: "eclipse",
    id: "eclipses",
    name: "Eclipses",
    sort: [{ root: "Eclipse" }],
  },
  {
    description: "Every event, with the default grouping and sort.",
    filter: [],
    group: [],
    icon: "layers",
    id: ALL_EVENTS_ID,
    name: "All Events",
    sort: [],
  },
];
