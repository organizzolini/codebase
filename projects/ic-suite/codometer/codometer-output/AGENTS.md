# codometer-output

Markdown badge rendering and JSON report formatting for Codometer measurements. It depends on `@codometer/configuration`, `@codometer/core`, `@codometer/measurement`.

## Modules

- `changes/` — Joins each project's current metrics to the baseline from `main` (`ChangesService`).
- `configuration-listing/` — Finds every codometer configuration in a tree and what each one holds (`ConfigurationListingService`).
- `delivery/` — Produces every resolved output, and says which written ones are stale (`DeliveryService`).
- `destinations/` — Resolves which file each of a run's outputs lands in (`DestinationsService`).
- `documents/` — Puts a rendered report body where it was asked for (`DocumentsService`).
- `json/` — Writes the report to a JSON file (`JsonService`).
- `markdown/` — Writes generated code statistics badges into a markdown file (`MarkdownService`).
- `render/` — Renders codometer's measured changes as the body of the report (`RenderService`).
- `report/` — Writes out what a run measured, in codometer's own shape (`ReportService`).
