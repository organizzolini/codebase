// ♟️ Constants

/**
 * The roots of the tag tree, one per dimension an event is classified
 * along. Independent attributes are separate roots, never nested under each
 * other, so an event carries one tag from each dimension side by side.
 */
export const TAG_ROOT = {
  aspectHarmonic: "Aspect Harmonic",
  aspectNature: "Aspect Nature",
  bodyClass: "Body Class",
  decan: "Decan",
  dignity: "Dignity",
  domain: "Domain",
  eclipseFrame: "Eclipse Frame",
  element: "Element",
  focalBody: "Focal Body",
  lunarPhase: "Lunar Phase",
  modality: "Modality",
  motion: "Motion",
  phase: "Phase",
  planet: "Planet",
  polarity: "Polarity",
  season: "Season",
  sign: "Sign",
  synodicStage: "Synodic Stage",
  temporality: "Temporality",
  timeOfDay: "Time of Day",
  type: "Type",
} as const;

/** Raw tags every detector attaches, which tell no event apart from another. */
export const UNCLASSIFIED_RAW_TAGS = ["Astronomy", "Astrology"] as const;
