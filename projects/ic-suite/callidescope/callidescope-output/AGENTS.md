# callidescope-output

Mermaid diagram generation, Markdown reports, and JSON export for Callidescope call graphs. It depends on `@callidescope/configuration`, `@callidescope/core`, `@callidescope/graph`.

## Modules

- `address-report/` — Renders `depth` and `breadth`'s findings for a terminal (`AddressReportService`).
- `output-json/` — Writes the traced findings to a JSON report file (`OutputJsonService`).
- `output-markdown/` — Splices a generated block into a markdown file, between two anchors (`OutputMarkdownService`).
- `project-reports/` — Scopes a run's findings to the project each one came from (`ProjectReportsService`).
- `report/` — Renders a run, or one project's slice of it, as markdown (`MarkdownReportService`).
- `report-findings/` — Weighs every finding a run produces, failing on the ones it gates (`ReportFindingsService`).
- `write-destinations/` — Writes a finished run to every destination it was configured with (`WriteDestinationsService`).
