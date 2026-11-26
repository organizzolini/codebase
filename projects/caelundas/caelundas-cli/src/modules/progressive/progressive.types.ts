// 🏷️ Types

/** One family whose instants mark the start or end of a stored span. */
export interface SpanBoundaryRule {
  /** The edge of the span the instant sits on. */
  edge: SpanEdge;
  /** Raw tags, any of which marks an instant that can bound the span. */
  instants: readonly string[];
  /** What the family is called. */
  name: string;
  /** Raw tags, any of which marks a span the instant bounds. */
  spans: readonly string[];
}

/** Which end of a span an instant sits on. */
export type SpanEdge = "either" | "end" | "start";

/**
 * Typed aspect and body labels extracted from an event.
 */
export interface TypedAspectParts<
  TAspect extends string,
  TBody extends string,
> {
  aspect: TAspect;
  aspectCapitalized: string;
  body1: TBody;
  body1Capitalized: string;
  body2: TBody;
  body2Capitalized: string;
}
