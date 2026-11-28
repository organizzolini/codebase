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

| Metric                   | Slug                          | Unit                       | Expression                                                |
| ------------------------ | ----------------------------- | -------------------------- | --------------------------------------------------------- |
| Average duration         | `average-duration`            | [duration](#unit-duration) | `metric:duration ÷ progressive-events`                    |
| Time covered             | `covered-duration`            | [duration](#unit-duration) | `covered-duration`                                        |
| Percent of time covered  | `covered-percent`             | [none](#unit-none)         | `covered-clipped-duration % of period-length`             |
| Days with events         | `days-with-events`            | [count](#unit-count)       | `days-with-events`                                        |
| Duration                 | `duration`                    | [duration](#unit-duration) | `duration`                                                |
| Events                   | `events`                      | [count](#unit-count)       | `events`                                                  |
| First start              | `first-start`                 | [instant](#unit-instant)   | `first-start`                                             |
| Last start               | `last-start`                  | [instant](#unit-instant)   | `last-start`                                              |
| Longest duration         | `longest-duration`            | [duration](#unit-duration) | `longest-progressive-duration`                            |
| Median duration          | `median-duration`             | [duration](#unit-duration) | `median-progressive-duration`                             |
| Perfective events        | `perfective-events`           | [count](#unit-count)       | `perfective-events`                                       |
| Progressive time covered | `progressive-covered-percent` | [none](#unit-none)         | `progressive-covered-clipped-duration % of period-length` |
| Progressive events       | `progressive-events`          | [count](#unit-count)       | `progressive-events`                                      |
| Progressive time counted | `progressive-total-percent`   | [none](#unit-none)         | `progressive-clipped-duration % of period-length`         |
| Shortest duration        | `shortest-duration`           | [duration](#unit-duration) | `shortest-progressive-duration`                           |
| Time counted             | `total-time-percent`          | [none](#unit-none)         | `clipped-duration % of period-length`                     |
| Unique names             | `unique-names`                | [count](#unit-count)       | `unique-names`                                            |
| Unique tags              | `unique-tags`                 | [count](#unit-count)       | `unique-tags`                                             |

## Unit count

```mermaid
flowchart LR
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    subgraph m0["Days with events"]
        direction TB
        m0n0["measure (days-with-events)"]
    end
    subgraph m1["Events"]
        direction TB
        m1n0["measure (events)"]
    end
    subgraph m2["Perfective events"]
        direction TB
        m2n0["measure (perfective-events)"]
    end
    subgraph m3["Progressive events"]
        direction TB
        m3n0["measure (progressive-events)"]
    end
    subgraph m4["Unique names"]
        direction TB
        m4n0["measure (unique-names)"]
    end
    subgraph m5["Unique tags"]
        direction TB
        m5n0["measure (unique-tags)"]
    end
    m0 ~~~ m1 ~~~ m2
    m3 ~~~ m4 ~~~ m5
    class m0n0,m1n0,m2n0,m3n0,m4n0,m5n0 measure
```

## Unit duration

```mermaid
flowchart LR
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    subgraph m0["Average duration"]
        direction TB
        m0n0(["Average duration (average-duration)"]) --> m0n1{{"÷ divide"}}
        m0n1 -->|"1"| m0n2(["Duration (duration)"])
        m0n1 -->|"2"| m0n3["Progressive events (progressive-events)"]
    end
    subgraph m1["Time covered"]
        direction TB
        m1n0["Covered duration (covered-duration)"]
    end
    subgraph m2["Duration"]
        direction TB
        m2n0["measure (duration)"]
    end
    subgraph m3["Longest duration"]
        direction TB
        m3n0["Longest progressive duration (longest-progressive-duration)"]
    end
    subgraph m4["Median duration"]
        direction TB
        m4n0["Median progressive duration (median-progressive-duration)"]
    end
    subgraph m5["Shortest duration"]
        direction TB
        m5n0["Shortest progressive duration (shortest-progressive-duration)"]
    end
    m0 ~~~ m1 ~~~ m2
    m3 ~~~ m4 ~~~ m5
    class m0n0 root
    class m0n1 operator
    class m0n2 metric
    class m0n3,m1n0,m2n0,m3n0,m4n0,m5n0 measure
```

## Unit instant

```mermaid
flowchart LR
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    subgraph m0["First start"]
        direction TB
        m0n0["measure (first-start)"]
    end
    subgraph m1["Last start"]
        direction TB
        m1n0["measure (last-start)"]
    end
    m0 ~~~ m1
    class m0n0,m1n0 measure
```

## Unit none

```mermaid
flowchart LR
    classDef operator fill:#9ec1fa,stroke:#1a73e8,color:#111
    classDef measure fill:#9fd7ae,stroke:#188038,color:#111
    classDef metric fill:#fbd774,stroke:#b06000,color:#111
    classDef root fill:#fbd774,stroke:#b06000,stroke-width:3px,color:#111
    subgraph m0["Percent of time covered"]
        direction TB
        m0n0(["Percent of time covered (covered-percent)"]) --> m0n1{{"% of percent"}}
        m0n1 -->|"1"| m0n2["Covered clipped duration (covered-clipped-duration)"]
        m0n1 -->|"2"| m0n3["Period length (period-length)"]
    end
    subgraph m1["Progressive time covered"]
        direction TB
        m1n0(["Progressive time covered (progressive-covered-percent)"]) --> m1n1{{"% of percent"}}
        m1n1 -->|"1"| m1n2["Progressive covered clipped duration (progressive-covered-clipped-duration)"]
        m1n1 -->|"2"| m1n3["Period length (period-length)"]
    end
    subgraph m2["Progressive time counted"]
        direction TB
        m2n0(["Progressive time counted (progressive-total-percent)"]) --> m2n1{{"% of percent"}}
        m2n1 -->|"1"| m2n2["Progressive clipped duration (progressive-clipped-duration)"]
        m2n1 -->|"2"| m2n3["Period length (period-length)"]
    end
    subgraph m3["Time counted"]
        direction TB
        m3n0(["Time counted (total-time-percent)"]) --> m3n1{{"% of percent"}}
        m3n1 -->|"1"| m3n2["Clipped duration (clipped-duration)"]
        m3n1 -->|"2"| m3n3["Period length (period-length)"]
    end
    m0 ~~~ m1 ~~~ m2
    class m0n0,m1n0,m2n0,m3n0 root
    class m0n1,m1n1,m2n1,m3n1 operator
    class m0n2,m0n3,m1n2,m1n3,m2n2,m2n3,m3n2,m3n3 measure
```

<!-- metric-expressions:end -->
