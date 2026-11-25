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
  calendar_event_day_rollups {
    string coveredRange "not nullable"
    array directTagIds "not nullable"
    float durationSeconds "not nullable"
    array eventNames "not nullable"
    float events "not nullable"
    date firstStart "not nullable"
    float instants "not nullable"
    date lastStart "not nullable"
    string localDay "not nullable"
    string localMonth "not nullable"
    string localQuarter "not nullable"
    string localWeek "not nullable"
    float localYear "not nullable"
    float progressiveSeconds "not nullable"
    array spanDurationSeconds "not nullable"
    float spans "not nullable"
  }
  calendar_event_day_tag_name_rollups {
    float events "not nullable"
    string localDay "not nullable"
    string localMonth "not nullable"
    string localQuarter "not nullable"
    string localWeek "not nullable"
    float localYear "not nullable"
    string name "not nullable"
    string tagId "not nullable"
    string tagRootId "not nullable"
  }
  calendar_event_day_tag_rollups {
    string coveredRange "not nullable"
    float directEvents "not nullable"
    array directTagIds "not nullable"
    float durationSeconds "not nullable"
    float events "not nullable"
    date firstStart "not nullable"
    float instants "not nullable"
    date lastStart "not nullable"
    string localDay "not nullable"
    string localMonth "not nullable"
    string localQuarter "not nullable"
    string localWeek "not nullable"
    float localYear "not nullable"
    float progressiveSeconds "not nullable"
    array spanDurationSeconds "not nullable"
    float spans "not nullable"
    float tagDepth "not nullable"
    string tagId "not nullable"
    string tagName "not nullable"
    string tagOrderKey "not nullable"
    string tagPath "not nullable"
    string tagRootId "not nullable"
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
    string calendarEventId "not nullable"
    array directTagIds "not nullable"
    float durationSeconds "not nullable"
    date end "not nullable"
    string extent "not nullable"
    boolean isInstant "not nullable"
    boolean isProgressive "not nullable"
    string localDay "not nullable"
    float localHour "not nullable"
    string localMonth "not nullable"
    string localQuarter "not nullable"
    string localWeek "not nullable"
    float localWeekday "not nullable"
    float localYear "not nullable"
    string name "not nullable"
    string span "not nullable"
    date start "not nullable"
    array tagIds "not nullable"
  }
  CalendarEventTag {
    string calendarEventId PK "not nullable"
    string tagId PK "not nullable"
  }
  CalendarEventTagNode {
    string calendarEventId PK "not nullable"
    string tagId PK "not nullable"
    boolean isDirect "not nullable"
    int tagDepth "not nullable"
    string tagName "not nullable"
    string tagPath "not nullable"
    string tagRootId "not nullable"
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
    int order "not nullable"
    string parentId "nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  TagNode {
    string id PK "not nullable"
    int depth "not nullable"
    string name "not nullable"
    string path "not nullable"
    string rootId "not nullable"
  }
```

<!-- postgresql-erd:end -->
