# conformetry-validation

Template matching, existence verification, and conformance validation orchestrator for Conformetry. It depends on `@conformetry/configuration`, `@conformetry/core`, `@conformetry/languages`.

## Modules

- `runner/` — Runs a language validator over a prepared document set (`RunnerService`).
- `validation/` — Collapses findings of overlapping instances into one report (`ValidationDeduplicationService`).
