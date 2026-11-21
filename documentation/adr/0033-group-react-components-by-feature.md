# 0033: Group React Components by Feature

Extends [ADR 0032](0032-nest-child-modules-under-a-modules-folder.md) to a web application's `src/components/` and `src/hooks/`, which the structure rule of [ADR 0011](0011-hold-one-path-law-for-every-project-type.md) shapes.

## Context

A web application kept every component folder directly under `src/components/` and allowed nothing but files inside one. Codometer's tree ceilings cap a directory at twelve entries, and caelundas-web held thirty-one component folders, its largest holding thirty-six files. Neither level could shrink without somewhere to put what it held.

## Decision

- **`src/components/` holds feature folders only.** A feature folder groups the components that work together, such as `calendar-display/` or `calendar-query/`, and holds component folders and nothing else.
- **A component folder holds its files and one named folder, `components/`,** whose children are child component folders shaped the same way, so nesting can repeat.
- **A hook folder holds its files and one named folder, `hooks/`,** whose children are child hook folders named `use-<hook>`.
- Conformetry judges each first-level component folder, `src/components/<feature>/<component>/`, and each first-level hook folder against its template. A child component or hook is not yet judged, as with child modules.

## Consequences

- A component's path names the feature it belongs to, and the twelve-entry ceiling has a place to split at every level.
- Every web application gains one path segment under `src/components/`, even one with few components.
- The React generators take a `--directory` naming the feature folder to generate into.
