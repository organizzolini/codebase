# codometer-core

The contracts leaf of the codometer package graph: the report and statistics shapes every other package reads and writes, the severity and symbol-kind vocabularies, and the configuration errors. Keep it to types, constants, and error classes. The service and module beside them are the generator's unused placeholder, with a `TODO` for their JSDoc. It depends on no other workspace package.

## Modules

- `codometer-core/` — `codometer-core.types.ts` declares the report, metric, limit, and per-language statistics shapes, and `codometer-core.constants.ts` holds `CODOMETER_SEVERITIES`, `CODOMETER_SYMBOL_KINDS`, and the `ConfigurationFileNotFoundError` family.
