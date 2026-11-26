# CaelundasDb Entity Relationship Diagram

<!-- postgresql-erd:start -->

```mermaid
erDiagram
  CalendarEventTag }o--|| CalendarEvent : calendarEvent
  CalendarEventTag }o--|| Tag : tag
  Constellation ||--o{ ConstellationEdge : edges
  ConstellationEdge }o--|| Constellation : graph
  ConstellationEdge }o--|| Star : source
  ConstellationEdge }o--|| Star : target
  Star ||--o{ ConstellationEdge : incomingEdges
  Star ||--o{ ConstellationEdge : outgoingEdges
  Tag ||--o{ Tag : children
  Tag }o--|| Tag : parent
  CalendarEvent {
    string id PK "not nullable"
    string color "nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    string description "not nullable"
    date end "not nullable"
    float latitude "not nullable"
    string location "nullable"
    float longitude "not nullable"
    date start "not nullable"
    string summary "not nullable"
    string timezone "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  calendar_event_derived_times {
    object color "not nullable"
    date createdAt "not nullable"
    object createdBy "not nullable"
    string description "not nullable"
    float durationMinutes "not nullable"
    date end "not nullable"
    string id "not nullable"
    string latitude "not nullable"
    object location "not nullable"
    string longitude "not nullable"
    date start "not nullable"
    string startDay "not nullable"
    float startHour "not nullable"
    string startLocalDay "not nullable"
    float startLocalHour "not nullable"
    float startMonth "not nullable"
    float startQuarter "not nullable"
    float startWeek "not nullable"
    float startWeekday "not nullable"
    float startYear "not nullable"
    string summary "not nullable"
    string temporality "not nullable"
    string timezone "not nullable"
    date updatedAt "not nullable"
    object updatedBy "not nullable"
  }
  calendar_event_facts {
    object calendarEventId "not nullable"
    object coveredRange "not nullable"
    object directTagIds "not nullable"
    object durationSeconds "not nullable"
    object end "not nullable"
    object eventNames "not nullable"
    object events "not nullable"
    object extent "not nullable"
    string filter "not nullable"
    object firstStart "not nullable"
    object instants "not nullable"
    object isInstant "not nullable"
    boolean isPhaseBoundary "not nullable"
    object isProgressive "not nullable"
    object lastStart "not nullable"
    string localDay "not nullable"
    object localHour "not nullable"
    string localMonth "not nullable"
    string localQuarter "not nullable"
    string localWeek "not nullable"
    object localWeekday "not nullable"
    float localYear "not nullable"
    object name "not nullable"
    object progressiveSeconds "not nullable"
    string rowKey "not nullable"
    object spanDurationSeconds "not nullable"
    object spans "not nullable"
    object start "not nullable"
    object tagDepth "not nullable"
    object tagId "not nullable"
    object tagIds "not nullable"
    object tagName "not nullable"
    object tagPath "not nullable"
    object tagRank "not nullable"
    object tagRootId "not nullable"
  }
  CalendarEventTag {
    string calendarEventId PK "not nullable"
    string tagId PK "not nullable"
  }
  Constellation {
    string designation PK "not nullable"
    string name "not nullable"
    boolean zodiac "not nullable"
  }
  ConstellationEdge {
    string constellation_designation PK "not nullable"
    int from_hip PK "not nullable"
    int to_hip PK "not nullable"
  }
  Star {
    int hip PK "not nullable"
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
    string parentId "nullable"
    int rank "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
```

<!-- postgresql-erd:end -->
