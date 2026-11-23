# CaelundasDb Entity Relationship Diagram

<!-- postgresql-erd:start -->

```mermaid
erDiagram
  CalendarEventTag }o--|| CalendarEvent : calendarEvent
  CalendarEventTag }o--|| Tag : tag
  ConstellationLine }o--|| Constellation : constellation
  ConstellationLine }o--|| Star : fromStar
  ConstellationLine }o--|| Star : toStar
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
  ConstellationLine {
    string constellationDesignation PK "not nullable"
    int fromHip PK "not nullable"
    int toHip PK "not nullable"
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
    string name "not nullable"
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
