/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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

export const FilterGroupFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FilterGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventFilterGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"combinator"}},{"kind":"Field","name":{"kind":"Name","value":"rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"negated"}},{"kind":"Field","name":{"kind":"Name","value":"operator"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}}]} as unknown as DocumentNode<FilterGroupFieldsFragment, unknown>;
export const PresetFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PresetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"filter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FilterGroupFields"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FilterGroupFields"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FilterGroupFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FilterGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventFilterGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"combinator"}},{"kind":"Field","name":{"kind":"Name","value":"rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"negated"}},{"kind":"Field","name":{"kind":"Name","value":"operator"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}}]} as unknown as DocumentNode<PresetFieldsFragment, unknown>;
export const DatasetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}}]}}]}}]} as unknown as DocumentNode<DatasetQuery, DatasetQueryVariables>;
export const EventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Events"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PeriodInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventFilterGroupInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"grouping"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventGroupingInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"grouping"},"value":{"kind":"Variable","name":{"kind":"Name","value":"grouping"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"durationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"startLocalDay"}},{"kind":"Field","name":{"kind":"Name","value":"startLocalHour"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"path"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"path"}}]}}]}}]}}]} as unknown as DocumentNode<EventsQuery, EventsQueryVariables>;
export const FacetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Facets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PeriodInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventFilterGroupInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"facets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"path"}}]}}]}}]}}]} as unknown as DocumentNode<FacetsQuery, FacetsQueryVariables>;
export const NightSkyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NightSky"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NightSkyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nightSky"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"svg"}},{"kind":"Field","name":{"kind":"Name","value":"measurements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bottomAltitudeDegrees"}},{"kind":"Field","name":{"kind":"Name","value":"fieldOfViewClamped"}},{"kind":"Field","name":{"kind":"Name","value":"fieldOfViewLimitDegrees"}},{"kind":"Field","name":{"kind":"Name","value":"periodSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"poleDistanceAboveScreen"}},{"kind":"Field","name":{"kind":"Name","value":"realTimeMultiple"}},{"kind":"Field","name":{"kind":"Name","value":"segmentsDrawn"}},{"kind":"Field","name":{"kind":"Name","value":"starsDrawn"}},{"kind":"Field","name":{"kind":"Name","value":"starsInCatalog"}},{"kind":"Field","name":{"kind":"Name","value":"svgLength"}},{"kind":"Field","name":{"kind":"Name","value":"topAltitudeDegrees"}},{"kind":"Field","name":{"kind":"Name","value":"verticalFieldOfViewDegrees"}}]}}]}}]}}]} as unknown as DocumentNode<NightSkyQuery, NightSkyQueryVariables>;
export const PresetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Presets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defaultPreset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PresetFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PresetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FilterGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventFilterGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"combinator"}},{"kind":"Field","name":{"kind":"Name","value":"rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"negated"}},{"kind":"Field","name":{"kind":"Name","value":"operator"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PresetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"filter"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FilterGroupFields"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FilterGroupFields"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FilterGroupFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PresetsQuery, PresetsQueryVariables>;
export const WindowsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Windows"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"anchor"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"window"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CalendarWindow"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TimelineScale"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"agendaDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"windows"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"anchor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"anchor"}}},{"kind":"Argument","name":{"kind":"Name","value":"window"},"value":{"kind":"Variable","name":{"kind":"Name","value":"window"}}},{"kind":"Argument","name":{"kind":"Name","value":"scale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scale"}}},{"kind":"Argument","name":{"kind":"Name","value":"agendaDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"agendaDays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"columnMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"visible"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"start"}}]}},{"kind":"Field","name":{"kind":"Name","value":"read"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"start"}}]}}]}}]}}]} as unknown as DocumentNode<WindowsQuery, WindowsQueryVariables>;