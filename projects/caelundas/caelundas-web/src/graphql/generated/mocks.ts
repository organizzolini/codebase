/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { graphql, type GraphQLResponseResolver, type RequestHandlerOptions } from 'msw'
/** A view the calendar offers. */
export type CalendarWindow =
  | 'AGENDA'
  | 'DAY'
  | 'MONTH'
  | 'THREE_DAY'
  | 'TIMELINE'
  | 'WEEK';

/** How a filter group joins the conditions and groups in it. */
export type EventFilterCombinator =
  | 'AND'
  | 'OR';

export type EventFilterGroupInput = {
  combinator: EventFilterCombinator;
  /** The groups nested in this one. */
  groups?: Array<EventFilterGroupInput> | null | undefined;
  /** The conditions of this group. */
  rules?: Array<EventFilterRuleInput> | null | undefined;
};

export type EventFilterRuleInput = {
  /** Keeps the events the condition does not hold for instead. */
  negated?: boolean | null | undefined;
  /** The operator, such as is_any_of, has_all_of, is_none_of, between, not_between, contains, not_contains, eq, neq, gt, gte, lt or lte. */
  operator: string;
  /** The field's id as its path: tag:<root tag id> for a tag root, or date, weekday, hour, duration, duration-minutes, temporality or text. */
  path: Array<string>;
  /** What the rule compares with: the tag ids or bucket names to pick from, the two ends of a range, or the one number or text, each written as text. */
  values?: Array<string> | null | undefined;
};

export type EventGroupLevelInput = {
  /** For a tag root with no tags picked, how many levels beneath the root to group by: 1 for the root's children. A tag that ends above the depth stands for itself. Defaults to 1. */
  depth?: number | null | undefined;
  /** What to group by: tag:<root tag id> for a tag root, or year, quarter, month, week, day, weekday, hour or duration, derived from each event's start or duration in the zone it was observed in. */
  field: string;
  /** For a tag root, the ids of the tags to make a group of each, in place of the root's children or a depth. */
  tags?: Array<string> | null | undefined;
};

export type EventGroupingInput = {
  /** One more level, read like a grouping level and returned after them, for the field the events are colored by; it does not count toward the three levels. */
  colorBy?: EventGroupLevelInput | null | undefined;
  /** Up to three levels, outermost first, by tag root or by year, quarter, month, week, day, weekday, hour or duration. */
  levels?: Array<EventGroupLevelInput> | null | undefined;
};

export type NightSkyInput = {
  /** Hexadecimal color at the bottom of the background. */
  backgroundBottomColor?: string | null | undefined;
  /** Hexadecimal color at the top of the background. */
  backgroundTopColor?: string | null | undefined;
  /** Altitude at the bottom edge, from -45 to 89. Defaults to 0. */
  bottomAltitudeDegrees?: number | null | undefined;
  /** Figures to draw: constellation names such as ursa_major, or all, zodiac or none. Defaults to the zodiac. */
  constellations?: Array<string> | null | undefined;
  /** Draws the zoomed-out tuning view instead of the backdrop. */
  debug?: boolean | null | undefined;
  /** Draws the ecliptic, the Sun's path. Defaults to true. */
  ecliptic?: boolean | null | undefined;
  /** Hexadecimal color of the ecliptic. */
  eclipticColor?: string | null | undefined;
  /** Opacity of the ecliptic, from 0 to 1. Defaults to 0.12. */
  eclipticOpacity?: number | null | undefined;
  /** Width of the ecliptic in pixels, from 0 to 10. Defaults to 1. */
  eclipticWidth?: number | null | undefined;
  /** Faintest star drawn, from -2 to 12. Defaults to 6.5. */
  faintestMagnitude?: number | null | undefined;
  /** Pixel height of the area the SVG fills. */
  height: number;
  /** Observer latitude above 0 and up to 90, north positive. Defaults to 90. */
  latitudeDegrees?: number | null | undefined;
  /** Hexadecimal color of the figures. */
  lineColor?: string | null | undefined;
  /** Opacity of the figures, from 0 to 1. Defaults to 0.24. */
  lineOpacity?: number | null | undefined;
  /** Width of the figures in pixels, from 0 to 10. Defaults to 0.8. */
  lineWidth?: number | null | undefined;
  /** Observer longitude, east positive, from -360 to 360. Defaults to -74. */
  longitudeDegrees?: number | null | undefined;
  /** On-screen drift speed at the window center, up to 1000. Defaults to 3. */
  pixelsPerSecond?: number | null | undefined;
  /** Multiplier on dot size, up to 10. Defaults to 1. */
  starScale?: number | null | undefined;
  /** Draws the sky at its starting angle with no animation, for reduced motion. */
  still?: boolean | null | undefined;
  /** The moment the sky is drawn for, which sets its starting angle with the longitude. Defaults to now. */
  time?: string | null | undefined;
  /** Degrees of altitude shown, up to 90. Defaults to 90. */
  verticalFieldOfViewDegrees?: number | null | undefined;
  /** Pixel width of the area the SVG fills. */
  width: number;
};

export type PeriodInput = {
  /** The moment the period stops at, which it does not include. */
  end: string;
  /** The first moment the period includes. */
  start: string;
};

/** The span the timeline shows at once: a day in fifteen-minute columns, a week or a month in days, a quarter in weeks, a year in months. */
export type TimelineScale =
  | 'DAY'
  | 'MONTH'
  | 'QUARTER'
  | 'WEEK'
  | 'YEAR';

export type DatasetQueryVariables = Exact<{ [key: string]: never; }>;


export type DatasetQuery = { dataset: { count: number, end: string, start: string, timezone: string } | null };

export type EventsQueryVariables = Exact<{
  period: PeriodInput;
  filter?: EventFilterGroupInput | null | undefined;
  grouping?: EventGroupingInput | null | undefined;
}>;


export type EventsQuery = { events: Array<{ color: string | null, description: string, durationMinutes: number, end: string, id: string, location: string | null, start: string, startLocalDay: string, startLocalHour: number, summary: string, timezone: string, groups: Array<Array<{ key: string, label: string | null, path: string | null }>>, tags: Array<{ depth: number, id: string, name: string, path: string }> }> };

export type FacetsQueryVariables = Exact<{
  period?: PeriodInput | null | undefined;
  filter?: EventFilterGroupInput | null | undefined;
}>;


export type FacetsQuery = { facets: Array<{ id: string, name: string, values: Array<{ count: number, depth: number, id: string, name: string, path: string }> }> };

export type NightSkyQueryVariables = Exact<{
  input: NightSkyInput;
}>;


export type NightSkyQuery = { nightSky: { svg: string, measurements: { bottomAltitudeDegrees: number, fieldOfViewClamped: boolean, fieldOfViewLimitDegrees: number, periodSeconds: number, poleDistanceAboveScreen: number, realTimeMultiple: number, segmentsDrawn: number, starsDrawn: number, starsInCatalog: number, svgLength: number, topAltitudeDegrees: number, verticalFieldOfViewDegrees: number } } };

export type PresetFieldsFragment = { description: string, id: string, name: string, filter: { combinator: EventFilterCombinator, groups: Array<{ combinator: EventFilterCombinator, groups: Array<{ combinator: EventFilterCombinator, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null }> | null, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null }> | null, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null } };

export type FilterGroupFieldsFragment = { combinator: EventFilterCombinator, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null };

export type PresetsQueryVariables = Exact<{ [key: string]: never; }>;


export type PresetsQuery = { defaultPreset: { description: string, id: string, name: string, filter: { combinator: EventFilterCombinator, groups: Array<{ combinator: EventFilterCombinator, groups: Array<{ combinator: EventFilterCombinator, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null }> | null, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null }> | null, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null } } | null, presets: Array<{ description: string, id: string, name: string, filter: { combinator: EventFilterCombinator, groups: Array<{ combinator: EventFilterCombinator, groups: Array<{ combinator: EventFilterCombinator, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null }> | null, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null }> | null, rules: Array<{ negated: boolean | null, operator: string, path: Array<string>, values: Array<string> | null }> | null } }> };

export type WindowsQueryVariables = Exact<{
  anchor: string;
  window?: CalendarWindow | null | undefined;
  scale?: TimelineScale | null | undefined;
  agendaDays?: number | null | undefined;
}>;


export type WindowsQuery = { windows: { columnMinutes: number | null, visible: { end: string, start: string }, read: { end: string, start: string } } };


/**
 * @param resolver A function that accepts [resolver arguments](https://mswjs.io/docs/api/graphql#resolver-argument) and must always return the instruction on what to do with the intercepted request. ([see more](https://mswjs.io/docs/concepts/response-resolver#resolver-instructions))
 * @param options Options object to customize the behavior of the mock. ([see more](https://mswjs.io/docs/api/graphql#handler-options))
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockDatasetQuery(
 *   ({ query, variables }) => {
 *     return HttpResponse.json({
 *       data: { dataset }
 *     })
 *   },
 *   requestOptions
 * )
 */
export const mockDatasetQuery = (resolver: GraphQLResponseResolver<DatasetQuery, DatasetQueryVariables>, options?: RequestHandlerOptions) =>
  graphql.query<DatasetQuery, DatasetQueryVariables>(
    'Dataset',
    resolver,
    options
  )

/**
 * @param resolver A function that accepts [resolver arguments](https://mswjs.io/docs/api/graphql#resolver-argument) and must always return the instruction on what to do with the intercepted request. ([see more](https://mswjs.io/docs/concepts/response-resolver#resolver-instructions))
 * @param options Options object to customize the behavior of the mock. ([see more](https://mswjs.io/docs/api/graphql#handler-options))
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockEventsQuery(
 *   ({ query, variables }) => {
 *     const { period, filter, grouping } = variables;
 *     return HttpResponse.json({
 *       data: { events }
 *     })
 *   },
 *   requestOptions
 * )
 */
export const mockEventsQuery = (resolver: GraphQLResponseResolver<EventsQuery, EventsQueryVariables>, options?: RequestHandlerOptions) =>
  graphql.query<EventsQuery, EventsQueryVariables>(
    'Events',
    resolver,
    options
  )

/**
 * @param resolver A function that accepts [resolver arguments](https://mswjs.io/docs/api/graphql#resolver-argument) and must always return the instruction on what to do with the intercepted request. ([see more](https://mswjs.io/docs/concepts/response-resolver#resolver-instructions))
 * @param options Options object to customize the behavior of the mock. ([see more](https://mswjs.io/docs/api/graphql#handler-options))
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockFacetsQuery(
 *   ({ query, variables }) => {
 *     const { period, filter } = variables;
 *     return HttpResponse.json({
 *       data: { facets }
 *     })
 *   },
 *   requestOptions
 * )
 */
export const mockFacetsQuery = (resolver: GraphQLResponseResolver<FacetsQuery, FacetsQueryVariables>, options?: RequestHandlerOptions) =>
  graphql.query<FacetsQuery, FacetsQueryVariables>(
    'Facets',
    resolver,
    options
  )

/**
 * @param resolver A function that accepts [resolver arguments](https://mswjs.io/docs/api/graphql#resolver-argument) and must always return the instruction on what to do with the intercepted request. ([see more](https://mswjs.io/docs/concepts/response-resolver#resolver-instructions))
 * @param options Options object to customize the behavior of the mock. ([see more](https://mswjs.io/docs/api/graphql#handler-options))
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockNightSkyQuery(
 *   ({ query, variables }) => {
 *     const { input } = variables;
 *     return HttpResponse.json({
 *       data: { nightSky }
 *     })
 *   },
 *   requestOptions
 * )
 */
export const mockNightSkyQuery = (resolver: GraphQLResponseResolver<NightSkyQuery, NightSkyQueryVariables>, options?: RequestHandlerOptions) =>
  graphql.query<NightSkyQuery, NightSkyQueryVariables>(
    'NightSky',
    resolver,
    options
  )

/**
 * @param resolver A function that accepts [resolver arguments](https://mswjs.io/docs/api/graphql#resolver-argument) and must always return the instruction on what to do with the intercepted request. ([see more](https://mswjs.io/docs/concepts/response-resolver#resolver-instructions))
 * @param options Options object to customize the behavior of the mock. ([see more](https://mswjs.io/docs/api/graphql#handler-options))
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockPresetsQuery(
 *   ({ query, variables }) => {
 *     return HttpResponse.json({
 *       data: { defaultPreset, presets }
 *     })
 *   },
 *   requestOptions
 * )
 */
export const mockPresetsQuery = (resolver: GraphQLResponseResolver<PresetsQuery, PresetsQueryVariables>, options?: RequestHandlerOptions) =>
  graphql.query<PresetsQuery, PresetsQueryVariables>(
    'Presets',
    resolver,
    options
  )

/**
 * @param resolver A function that accepts [resolver arguments](https://mswjs.io/docs/api/graphql#resolver-argument) and must always return the instruction on what to do with the intercepted request. ([see more](https://mswjs.io/docs/concepts/response-resolver#resolver-instructions))
 * @param options Options object to customize the behavior of the mock. ([see more](https://mswjs.io/docs/api/graphql#handler-options))
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockWindowsQuery(
 *   ({ query, variables }) => {
 *     const { anchor, window, scale, agendaDays } = variables;
 *     return HttpResponse.json({
 *       data: { windows }
 *     })
 *   },
 *   requestOptions
 * )
 */
export const mockWindowsQuery = (resolver: GraphQLResponseResolver<WindowsQuery, WindowsQueryVariables>, options?: RequestHandlerOptions) =>
  graphql.query<WindowsQuery, WindowsQueryVariables>(
    'Windows',
    resolver,
    options
  )
