// ♟️ Constants

/** The inscription attributes a search can match, in the order they are shown. */
export const ATTRIBUTE_FIELDS = [
  "province",
  "findSpot",
  "inscriptionType",
  "material",
] as const;

/** Labels for the eras an Author can belong to. */
export const ERA_LABELS: Readonly<Record<string, string>> = {
  ARCHAIC: "Archaic",
  CLASSICAL: "Classical",
  IMPERIAL: "Imperial",
  LATE: "Late",
  MEDIEVAL: "Medieval",
  NEO_LATIN: "Neo-Latin",
};

/** The field name a joined line's match ranges carry. */
export const JOINED_FIELD = "line";

/** What sits between the values of a joined line. */
export const JOIN_SEPARATOR = " · ";
