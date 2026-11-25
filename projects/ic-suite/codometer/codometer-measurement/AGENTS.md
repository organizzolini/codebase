# codometer-measurement

File discovery, size calculation, and custom metric evaluation engine for Codometer. It depends on `@codometer/configuration`, `@codometer/core`, `@codometer/languages`.

## Modules

- `customization/` — Counts the conventions a repository holds itself to (`CustomizationService`).
- `discovery/` — Discovers and categorizes the files of a codebase directory (`DiscoveryService`).
- `inputs/` — Lists the files an input holds (`InputsService`).
- `limits/` — Holds measured metrics to the limits declared against them (`LimitsService`).
- `measure/` — Aggregates every analyzer's report into a single set of statistics (`MeasureService`).
- `size/` — Measures how many bytes a target's files occupy once compressed (`SizeService`).
- `tree/` — Measures the shape of a file tree: how many entries each directory holds, and how deep directories nest (`TreeService`).
