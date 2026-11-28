import type { SpanBoundaryRule } from "./progressive.types";

// ♟️ Constants

/** Token for the finders of boundaries a window cuts off. */
export const EDGE_EVENTS_FINDERS_TOKEN = "EDGE_EVENTS_FINDERS_TOKEN";

/** Raw tags of instants that only build spans, so they are never stored: the stations. */
export const SPAN_ONLY_INSTANT_TAGS: readonly string[] = ["Direction"];

/** Instants of these families are dropped when a stored span bounds them. */
export const SPAN_BOUNDARY_RULES: readonly SpanBoundaryRule[] = [
  {
    edge: "start",
    instants: ["Forming"],
    name: "aspect forming",
    spans: ["Simple Aspect", "Compound Aspect"],
  },
  {
    edge: "end",
    instants: ["Dissolving"],
    name: "aspect dissolving",
    spans: ["Simple Aspect", "Compound Aspect"],
  },
  {
    edge: "either",
    instants: ["Monthly Lunar Cycle"],
    name: "moon phase",
    spans: ["Monthly Lunar Cycle"],
  },
  {
    edge: "either",
    instants: ["Lunar Apsides"],
    name: "lunar apsis",
    spans: ["Lunar Apsides"],
  },
  {
    edge: "either",
    instants: [
      "Evening Rise",
      "Evening Set",
      "Morning Rise",
      "Morning Set",
      "Eastern Elongation",
      "Western Elongation",
      "Opposition",
    ],
    name: "planetary rise, set, elongation, opposition",
    spans: ["Planetary Phase"],
  },
  {
    edge: "start",
    instants: ["Beginning"],
    name: "eclipse beginning",
    spans: ["Eclipse"],
  },
  {
    edge: "end",
    instants: ["Ending"],
    name: "eclipse ending",
    spans: ["Eclipse"],
  },
  {
    edge: "either",
    instants: ["Ingress"],
    name: "ingress",
    spans: ["Ingress"],
  },
  {
    edge: "either",
    instants: ["Annual Solar Cycle"],
    name: "solar year point",
    spans: ["Annual Solar Cycle"],
  },
  {
    edge: "either",
    instants: ["Twilight"],
    name: "twilight boundary",
    spans: ["Twilight"],
  },
];
