# callidescope-graph

TypeScript AST call-graph builder and call-stack depth and breadth traversal engine for Callidescope. It depends on `@callidescope/configuration`, `@callidescope/core`.

## Modules

- `callables/` — Resolves a human-typed callable address to the callable it names (`AddressService`).
- `classes/` — Resolves an interface or abstract member to the classes that implement it (`ClassesService`).
- `documentation/` — Reads what a callable's documentation comment says about it (`DocumentationService`).
- `edges/` — Finds the calls one callable makes, skipping nested bodies (`CallSitesService`).
- `entries/` — Decides which callables are the roots of a call stack (`EntriesService`).
- `graph/` — Builds the call graph, its cycle condensation, and its depth measurement (`GraphAssemblyService`).
- `program/` — Builds compiler hosts that share parsed source files across programs (`CompilerHostService`).
- `signatures/` — Reads what a callable takes and what it gives back (`SignaturesService`).
- `workspace/` — Decides which files a run leaves out of the graph (`FileFilterService`).
