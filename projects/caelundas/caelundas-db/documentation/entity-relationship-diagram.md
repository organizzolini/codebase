# CaelundasDb Entity Relationship Diagram

<!-- postgresql-erd:start -->

```mermaid
erDiagram
  CalendarEventFact }o--|| Filter : filter
  CalendarEventFact }o--|| Measure : measure
  CalendarEventTag }o--|| CalendarEvent : calendarEvent
  CalendarEventTag }o--|| Tag : tag
  Constellation ||--o{ ConstellationEdge : edges
  ConstellationEdge }o--|| Constellation : constellation
  ConstellationEdge }o--|| Star : source
  ConstellationEdge }o--|| Star : target
  DimensionEdge }o--|| Dimension : source
  DimensionEdge }o--|| Dimension : target
  Filter }o--|| Group : group
  Filter }o--|| Filter : parent
  Filter }o--|| Tag : tag
  GroupDimension }o--|| Dimension : dimension
  GroupDimension }o--|| Group : group
  Metric }o--|| MetricExpression : expression
  MetricExpression ||--o{ MetricExpression : children
  MetricExpression }o--|| Measure : measure
  MetricExpression }o--|| Metric : metric
  MetricExpression }o--|| MetricExpression : parent
  Star ||--o{ ConstellationEdge : incomingEdges
  Star ||--o{ ConstellationEdge : outgoingEdges
  Tag ||--o{ TagEdge : childEdges
  Tag ||--o{ TagEdge : parentEdges
  TagEdge }o--|| Tag : source
  TagEdge }o--|| Tag : target
  metric_expressions_closure }o--|| MetricExpression : ancestor_id
  metric_expressions_closure }o--|| MetricExpression : descendant_id
  CalendarEvent {
    string id PK "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    date end "not nullable"
    date endLocalDay "not nullable"
    float latitude "not nullable"
    float longitude "not nullable"
    string name "not nullable"
    string note "not nullable"
    date start "not nullable"
    date startLocalDay "not nullable"
    int startLocalHour "not nullable"
    string timezone "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  CalendarEventFact {
    string filterId PK "not nullable"
    string measureId PK "not nullable"
    float measurement "not nullable"
  }
  CalendarEventTag {
    string calendarEventId PK "not nullable"
    string tagId PK "not nullable"
  }
  calendar_event_tag_sets["calendar_event_tag_sets (materialized view)"] {
    array ancestorTagIds "not nullable"
    string calendarEventId "not nullable"
    array tagIds "not nullable"
  }
  Constellation {
    string designation PK "not nullable"
    boolean isZodiac "not nullable"
    string name "not nullable"
  }
  ConstellationEdge {
    string constellationId PK "not nullable"
    int sourceNode PK "not nullable"
    int targetNode PK "not nullable"
  }
  Dimension {
    string id PK "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    string icon "not nullable"
    string name "not nullable"
    string note "not nullable"
    string slug "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  DimensionEdge {
    string sourceNode PK "not nullable"
    string targetNode PK "not nullable"
  }
  Filter {
    string id PK "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    string eventName "nullable"
    string groupId "not nullable"
    string icon "nullable"
    string name "nullable"
    string note "nullable"
    string parentId "nullable"
    date period "nullable"
    string slug "nullable"
    string tagId "nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  Group {
    string id PK "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    string icon "not nullable"
    string name "not nullable"
    string note "not nullable"
    string slug "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  GroupDimension {
    string dimensionId PK "not nullable"
    string groupId PK "not nullable"
  }
  Measure {
    string id PK "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    string icon "not nullable"
    string name "not nullable"
    string note "not nullable"
    string slug "not nullable"
    string unit "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  Metric {
    string id PK "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    string expressionId "nullable"
    string icon "not nullable"
    string name "not nullable"
    string note "not nullable"
    string slug "not nullable"
    string unit "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  MetricExpression {
    string id PK "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    string kind "not nullable"
    string measureId "nullable"
    string metricId "nullable"
    string operator "nullable"
    string parentId "nullable"
    int position "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  Star {
    int hipparcosNumber PK "not nullable"
    float colorIndex "not nullable"
    float declinationDegrees "not nullable"
    float magnitude "not nullable"
    float rightAscensionHours "not nullable"
  }
  Tag {
    string id PK "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    string icon "nullable"
    string name "not nullable"
    string note "nullable"
    int rank "not nullable"
    string slug "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  tag_closures["tag_closures (materialized view)"] {
    string ancestorId "not nullable"
    string descendantId "not nullable"
  }
  TagEdge {
    string source_node PK "not nullable"
    string target_node PK "not nullable"
  }
  metric_expressions_closure {
    string ancestor_id PK "not nullable"
    string descendant_id PK "not nullable"
  }
```

<!-- postgresql-erd:end -->
