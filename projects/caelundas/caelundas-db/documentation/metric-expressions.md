# Metric expressions

Each metric is a tree in `metric_expressions`: an operator over its operands, a
measure, another metric, or a literal. Every diagram below draws one metric's
tree, top to bottom, in plain Mermaid with no HTML: the metric as a stadium,
operators as hexagons, measures as rectangles, referenced metrics as stadiums
and literals as circles. Operands of a divide or subtract are numbered by their
position; operands of an add or multiply are not, since order does not matter.
Run `nx run caelundas-db:metric-expressions` to rewrite the
block between the markers from the local database, and
`nx run caelundas-db:metric-expressions:check` to verify it. Do not edit the
generated content between the markers.

<!-- metric-expressions:start -->

## Metrics

| Metric                   | Slug                          | Unit     | Expression                                                |
| ------------------------ | ----------------------------- | -------- | --------------------------------------------------------- |
| Average duration         | `average-duration`            | duration | `metric:duration ÷ progressive-events`                    |
| Time covered             | `covered-duration`            | duration | `covered-duration`                                        |
| Percent of time covered  | `covered-percent`             | none     | `covered-clipped-duration % of period-length`             |
| Days with events         | `days-with-events`            | count    | `days-with-events`                                        |
| Duration                 | `duration`                    | duration | `duration`                                                |
| Events                   | `events`                      | count    | `events`                                                  |
| First start              | `first-start`                 | instant  | `first-start`                                             |
| Last start               | `last-start`                  | instant  | `last-start`                                              |
| Longest duration         | `longest-duration`            | duration | `longest-progressive-duration`                            |
| Median duration          | `median-duration`             | duration | `median-progressive-duration`                             |
| Perfective events        | `perfective-events`           | count    | `perfective-events`                                       |
| Progressive time covered | `progressive-covered-percent` | none     | `progressive-covered-clipped-duration % of period-length` |
| Progressive events       | `progressive-events`          | count    | `progressive-events`                                      |
| Progressive time counted | `progressive-total-percent`   | none     | `progressive-clipped-duration % of period-length`         |
| Shortest duration        | `shortest-duration`           | duration | `shortest-progressive-duration`                           |
| Time counted             | `total-time-percent`          | none     | `clipped-duration % of period-length`                     |
| Unique names             | `unique-names`                | count    | `unique-names`                                            |
| Unique tags              | `unique-tags`                 | count    | `unique-tags`                                             |

## Diagrams

### Average duration

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0(["Average duration (average-duration)"])
    n1{{"÷ divide"}}
    n2(["Duration (duration)"])
    n3["Progressive events (progressive-events)"]
    n0 --> n1
    n1 -->|"1"| n2
    n1 -->|"2"| n3
    class n0 root
    class n1 operator
    class n2 metric
    class n3 measure
```

### Time covered

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["Covered duration (covered-duration)"]
    class n0 measure
```

### Percent of time covered

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0(["Percent of time covered (covered-percent)"])
    n1{{"% of percent"}}
    n2["Covered clipped duration (covered-clipped-duration)"]
    n3["Period length (period-length)"]
    n0 --> n1
    n1 -->|"1"| n2
    n1 -->|"2"| n3
    class n0 root
    class n1 operator
    class n2 measure
    class n3 measure
```

### Days with events

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (days-with-events)"]
    class n0 measure
```

### Duration

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (duration)"]
    class n0 measure
```

### Events

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (events)"]
    class n0 measure
```

### First start

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (first-start)"]
    class n0 measure
```

### Last start

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (last-start)"]
    class n0 measure
```

### Longest duration

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["Longest progressive duration (longest-progressive-duration)"]
    class n0 measure
```

### Median duration

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["Median progressive duration (median-progressive-duration)"]
    class n0 measure
```

### Perfective events

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (perfective-events)"]
    class n0 measure
```

### Progressive time covered

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0(["Progressive time covered (progressive-covered-percent)"])
    n1{{"% of percent"}}
    n2["Progressive covered clipped duration (progressive-covered-clipped-duration)"]
    n3["Period length (period-length)"]
    n0 --> n1
    n1 -->|"1"| n2
    n1 -->|"2"| n3
    class n0 root
    class n1 operator
    class n2 measure
    class n3 measure
```

### Progressive events

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (progressive-events)"]
    class n0 measure
```

### Progressive time counted

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0(["Progressive time counted (progressive-total-percent)"])
    n1{{"% of percent"}}
    n2["Progressive clipped duration (progressive-clipped-duration)"]
    n3["Period length (period-length)"]
    n0 --> n1
    n1 -->|"1"| n2
    n1 -->|"2"| n3
    class n0 root
    class n1 operator
    class n2 measure
    class n3 measure
```

### Shortest duration

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["Shortest progressive duration (shortest-progressive-duration)"]
    class n0 measure
```

### Time counted

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0(["Time counted (total-time-percent)"])
    n1{{"% of percent"}}
    n2["Clipped duration (clipped-duration)"]
    n3["Period length (period-length)"]
    n0 --> n1
    n1 -->|"1"| n2
    n1 -->|"2"| n3
    class n0 root
    class n1 operator
    class n2 measure
    class n3 measure
```

### Unique names

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (unique-names)"]
    class n0 measure
```

### Unique tags

```mermaid
flowchart TB
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    n0["measure (unique-tags)"]
    class n0 measure
```

<!-- metric-expressions:end -->
