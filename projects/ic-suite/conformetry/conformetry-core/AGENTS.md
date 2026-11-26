# conformetry-core

The shared contract every other conformetry package depends on: the structured
`ConformetryError` shape, the validator plugin interface plus its shared
execution envelope, and error reporting. This package is a graph leaf — it must
never import another conformetry package, or it would create a cycle.

The service and module beside the types are the generator's unused placeholder, with a `TODO` for their JSDoc.

## Modules

- `conformetry-core/` — `conformetry-core.types.ts` declares `ConformetryDifference`, `ConformetryLanguageValidator`, `FileSystemAdapter`, `GeneratorDefinition`, and the inventory types; `src/index.ts` re-exports them.
