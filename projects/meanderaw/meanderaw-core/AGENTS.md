# MeanderawCore: Drawing Stack Library

## Quick Start

**Type**: NestJS library package (`@codebase/meanderaw-core`), not an application.
It has no entry point, no HTTP server, and no `NestFactory` bootstrap.

**Purpose**: The drawing stack for Greek meanders: a Code becomes a tile
vocabulary, a symmetry group, a matrix view, a geometry scale, and finally an
SVG document. `meanderaw-cli` draws with it, and a later browser build can
construct the same services by hand.

## Architecture Overview

### Tech Stack

- **Framework**: NestJS modules and dependency injection, used as plain
  constructor-injected classes so they also work without a container
- **Language**: Strict TypeScript
- **Tests**: Vitest, with `@codebase/testing/nestjs` for module-backed suites

### Dependency Direction

```text
DrawingModule -> CodeModule, GeometryModule, SvgModule
MatrixModule  -> CodeModule
CodeModule    -> SymmetryModule
SymmetryModule -> TileModule
TileModule, GeometryModule, SvgModule import nothing
```

Nothing in this package imports from `meanderaw-cli` or any application.

### Directory Layout

```text
src/
  index.ts                          # Public API: re-exports every module, service, and type
  index.unit.test.ts                # Builds DrawingService with `new`, no Nest container
  modules/
    tile/                           # Tile vocabulary: directions, malformed-tile errors
    symmetry/                       # The symmetry group two tiles are the same drawing under
    code/                           # A meander's Code and the directions each point carries
    matrix/                         # 2D matrix views over a Code, with column wrapping
    geometry/                       # The shared pixel scale every drawing resolves through
    svg/                            # Path data to an SVG document
    drawing/                        # A Code to an SVG document
testing/
  setup.ts                          # Vitest setup
  tiles.ts                          # buildTile fixtures, exported as @codebase/meanderaw-core/testing/tiles
```

Each module folder holds its service, its module, its types, its constants, and
its unit test. The characteristic evaluators stay in `meanderaw-cli`, because
only the draw run computes them.

## Development

### Commands

Run every task through Nx:

```bash
pnpm exec nx run meanderaw-core:vitest:unit
pnpm exec nx run meanderaw-core:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check
pnpm exec nx run meanderaw-core:type-coverage
```

### Rules

- Keep every service a plain constructor-injected class, so `new` builds it.
- Add exports to `src/index.ts` when a consumer needs them, and nothing else.
- Keep `private: true`; this package is consumed inside the workspace only.
- Scaffold new files with `conformetry-generate` rather than by hand.
