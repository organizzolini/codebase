---
type: documentation
title: Meanderaw Testing
description: Documents testing infrastructure for meanderaw-cli and meanderaw-web, covering vitest configuration, historical corpus test set, enumeration logic, characteristic measurement, database integration tests with testcontainers, and web rendering tests.
tags: [testing, meanderaw, vitest, integration, database, historical-corpus]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-26T01:23:39.729Z
sources:
  - id: openwiki-source-6315af249215d8768fb68811
    resource: repo://.github/workflows/continuous-integration.yml
  - id: openwiki-source-7a89510ce877b9983c90453f
    resource: repo://configuration/vitest.config.ts
  - id: openwiki-source-cb614db653b869e1d972f0f7
    resource: repo://documentation/adr/0013-hold-the-historical-corpus-as-a-test-set.md
  - id: openwiki-source-a688f65f433758aea382c292
    resource: repo://projects/common/persistence/src/modules/postgresql/postgresql-container.utilities.ts
  - id: openwiki-source-4808dd4ba16cde901f5bc82f
    resource: repo://projects/common/persistence/testing/persistence-testing.utilities.ts
  - id: openwiki-source-f6fca1a50278c67112e9cc2c
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts
  - id: openwiki-source-ac9abc9491999e2e8962ecd4
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/corpus/historical-corpus.constants.ts
  - id: openwiki-source-b1677a691c253dc8225edc22
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.integration.test.ts
  - id: openwiki-source-ae9a38ff624a7d01fa2cbd93
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/draw/draw-run-collision.command.integration.test.ts
  - id: openwiki-source-d2bcabd613e9901cd5519864
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/draw/draw-run.command.integration.test.ts
  - id: openwiki-source-672aff72681ba7e697f7f493
    resource: repo://projects/meanderaw/meanderaw-cli/testing/draw-run-budget.ts
  - id: openwiki-source-41bb487c303b25bd36fe1fcf
    resource: repo://projects/meanderaw/meanderaw-cli/testing/legacy-characteristics.ts
  - id: openwiki-source-31df022f564cf499f34b4ed0
    resource: repo://projects/meanderaw/meanderaw-cli/testing/letters.ts
  - id: openwiki-source-693028bc5d1e4d56b7b8dc8a
    resource: repo://projects/meanderaw/meanderaw-cli/testing/meanders.ts
  - id: openwiki-source-23927d707236bf2773e0650f
    resource: repo://projects/meanderaw/meanderaw-cli/testing/tiles.ts
  - id: openwiki-source-322411f15eb767453390f5be
    resource: repo://projects/meanderaw/meanderaw-cli/vitest.config.ts
  - id: openwiki-source-7dfbad913a99a1f268e48f67
    resource: repo://projects/meanderaw/meanderaw-web/src/routes/index.integration.test.tsx
  - id: openwiki-source-5d6dd2a3bd56ed7b85007917
    resource: repo://projects/meanderaw/meanderaw-web/testing/render-route.tsx
  - id: openwiki-source-b17018e99ba1a5502f1a4a5d
    resource: repo://projects/meanderaw/meanderaw-web/vitest.config.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---

# Meanderaw Testing

This page documents the testing architecture for the meanderaw project, which consists of two sub-projects: `meanderaw-cli` (the core computation engine) and `meanderaw-web` (the TanStack Start web application). Both use **vitest** as the test runner with project-specific configurations merged from a shared base.

## Test Infrastructure Overview

### Shared Base Configuration

The root `configuration/vitest.config.ts` provides the shared baseline:

- **Coverage thresholds**: 96% across branches, functions, lines, statements
- **Test file patterns**: `src/**/*.test.{ts,tsx}` and `testing/**/*.test.{ts,tsx}`
- **Setup file**: `./testing/setup.ts` (in each project's testing directory)
- **TypeScript path resolution** via `tsconfigPaths: true`

### Project Configurations

#### meanderaw-cli

`projects/meanderaw/meanderaw-cli/vitest.config.ts` extends the base with:

- **Extended timeouts**: `hookTimeout: 120_000` (2 min) for container startup + migrations; `testTimeout: 60_000` (1 min) for exhaustive enumeration tests
- **Coverage exclusion**: `src/**/*.test.ts` excluded from coverage

The CLI tests are **not fast unit tests** — they exhaustively enumerate the mosaic space (every subset of a tile's edges), render every tile, parse it back, and measure characteristics. This produces tens of thousands of real documents per test run, which is the entire claim: a space you can look through, gated over its entirety rather than a sample.

#### meanderaw-web

`projects/meanderaw/meanderaw-web/vitest.config.ts` extends the base with:

- **Environment**: `jsdom` for React component testing
- **Coverage exclusions**: Server function files (`*.functions.ts`), router internals, root layout — because `createServerFn` only runs inside the Start runtime; the logic they delegate to is tested in each module's `.utilities.ts`

---

## Historical Corpus Test Set (ADR 0013)

The historical corpus is a **committed reference set of 1,184 meander drawings** extracted from the retired `output/` filesystem tree at frozen commit `ab3c4526b^`. This corpus serves as a **test set, not an oracle** — the family labels record where each drawing was filed in the old file tree, not what the drawing fundamentally is.

### Corpus Construction

The extraction read every drawing under the retired `output/` tree, addressed each at the span and pitch its own path declares, and collapsed the result to one entry per Code. Each entry carries:

- **Code** — the formatted lattice address (e.g., `02x02y4488`)
- **rows** — the band's row count
- **columns** — the repeat's column count
- **filedUnder** — an array of every family name the tree gave that Code, in tree order

The corpus is committed across 11 chunk files (`historical-corpus-1.constants.ts` through `historical-corpus-11.constants.ts`) in `projects/meanderaw/meanderaw-cli/src/modules/corpus/`, each capped at 512 printed lines (an entry costs 1 or 6 lines depending on Code length). The combined `HISTORICAL_CORPUS` constant reassembles them.

### Known Contradictions in the Corpus

The extraction revealed **21 Codes filed under two different families** simultaneously:

- **Nine `whirl` drawings also filed as `snake`** — at every row count from 4 to 12, `snake/<n>-rows/edge-6-repeats-<n>r<n>c.svg` and `whirl/<n>-rows/plain-6-repeats-<n>r<n>c.svg` are the same drawing with the same Code. The retired extraction deduplicated by Code keeping the first occurrence; `snake` sorts before `whirl`, so all nine were filed as `snake` (the `flip` variants ended up in `whirl`).
- **Ten `branch` drawings also filed as `parallel`** — at every row count from 3 to 12, `branch`'s `plain` variant and `parallel`'s `aligned-strands-1` variant draw the identical two-stroke tile. Plus one pair each: `boxes`' 3-row `plain` is also `branch`'s 3-row `rung-northwest` and `rung-southwest`; `negative`'s 3-row `plain` is also `parallel`'s 3-row `serpentine-strands-3-offset-1`.
- **73 entries are cyclic column duplicates** — a second, larger kind of duplicate where the same drawing appears at multiple column rotations.

### Testing Philosophy

The corpus is **evidence, and evidence can be wrong**. A family rule that disagrees with a corpus label has found a disagreement to adjudicate by looking at the drawing — it has not failed a test. The retired aspect-ratio rules reproduced this corpus perfectly and were still wrong (they failed against the enumerated space, which the corpus never contained). A corpus that any wrong rule can satisfy is not an oracle.

**Consequences for testing:**
- A family rule is tested against `HISTORICAL_CORPUS` and every disagreement is looked at, not assumed to be the rule's fault
- The fixture set alone cannot validate a family rule; the enumerated space has to be reviewed as well
- `filedUnder` is an array, so a Code filed under two names keeps both, and a contradiction stays visible **in the corpus** instead of being resolved by whichever name happened to sort first
- The twenty-one contradictions are open questions, not defects fixed here
- The nine mis-filed whirls are one meander stored once, not twice, because they are literally one drawing filed twice

### Corpus Ingestion in Draw Runs

`CorpusService` ingests the historical corpus into the `meanders` database table **through the exact same pipeline** used for enumerated meanders (generic reader → canonical phase → `CharacteristicsService.compute`). Only the Code comes from the corpus; all characteristics are measured fresh.

**Which entries are ingested is computed, not listed:**
- The corpus was extracted against a 16-edge budget (`HISTORICAL_CORPUS_EDGE_BUDGET = 16`)
- The draw run starts at a row floor (`DRAW_MINIMUM_ROWS`) because a single-row band has no southward edges
- An entry is preserved as a hardcoded row when **either bound puts it outside** the enumeration's reach
- Raising the draw run's edge budget never drops a hardcoded meander — the 1,026 preserved entries are exactly what the retired constants files held

**Collision handling:** Both halves (enumeration + hardcoded ingestion) write through the same unique index on the lattice address. The hardcoded half is ingested first; enumeration skips any Code it already holds. A collision across halves resolves to the hardcoded row; a collision within either half still fails its insert. Nothing short of running both halves for real catches a collision.

---

## meanderaw-cli Testing

### Core Testing Utilities

Located in `projects/meanderaw/meanderaw-cli/testing/`:

| File | Purpose |
|------|---------|
| `setup.ts` | Creates `./output` directory; mocks console.log/error/warn to silence noise |
| `mocks.ts` | `mockDates()` helper — fake timers with fixed `DEFAULT_TEST_DATE = 2025-03-20T14:46:00Z` |
| `meanders.ts` | Builders for `Characteristics` and `MeanderRecord` fixtures with full type-checking |
| `tiles.ts` | `buildTile()` — hand-writes tiles by describing edges each point owns (east/south) |
| `legacy-characteristics.ts` | Frozen legacy values from retired `CharacteristicsService` for regression pinning |
| `letters.ts` | Harness for letter characteristic evaluators (16 orientations per positional form) |
| `path-data.ts` | SVG path assertions: `retracesItself()`, `rightmostX()`, `splitTrace()` |
| `draw-run.ts` / `draw-run-budget.ts` | Integration test harness for full draw runs against real Postgres |

### Fixture Builders: Type-Safe Test Data

`projects/meanderaw/meanderaw-cli/testing/meanders.ts` defines **zero-value constants** for every characteristic key — numeric and boolean — so adding a new key fails compilation until its default is added. The `characteristicRecord(overrides)` and `meanderRecord(overrides)` builders merge overrides on top of the zero baseline, ensuring tests only specify what they're about.

`projects/meanderaw/meanderaw-cli/testing/tiles.ts` provides `buildTile(rowDescriptions)` — a tile is written as the edges its points *own* (eastward `e`, southward `s`, both `b`, neither `.`), which is the shortest complete description that cannot be self-contradictory. The real `TileService` builds the internal representation, so hand-written tiles are derived exactly as enumerated ones.

### Legacy Characteristic Regression Suite

`projects/meanderaw/meanderaw-cli/testing/legacy-characteristics.ts` captures the output of the retired monolithic `CharacteristicsService` for a fixed set of Codes. Each fixture is a space-separated line of values in `LEGACY_FIELD_KEYS` order. This pins the new evaluator architecture to the exact values the old service produced, catching drift.

### Letter Characteristic Testing

`projects/meanderaw/meanderaw-cli/testing/letters.ts` provides a `LetterHarness` that compiles a Nest testing module with the letter's `CharacteristicEvaluatorGroup` and reads its 16 orientation evaluators by name. Each Arabic letter has multiple positional forms (initial, medial, final, isolated); the harness lets tests narrow to one form's evaluators via `form(prefix)`.

The harness exposes:
- `counts(fixture)` — orientation name → count of ink matching that orientation
- `inkedWindow(fixture)` — bounding box of inked points
- `keys()` — evaluator metadata keys
- `namesDescribing(text)` — orientation names whose description mentions text
- `windows(names)` — declared submatrix window per orientation

### Enumeration Logic Tests

Unit tests for enumeration live alongside source modules (e.g., `src/modules/enumeration/enumeration.service.unit.test.ts`, `src/modules/enumeration/tile-enumeration.service.unit.test.ts`). They test:
- Tile enumeration across all edge assignments
- Shape enumeration (columns × rows)
- Symmetry deduplication
- Lattice addressing (codes as coordinates in the enumeration space)

### Characteristic Measurement Tests

Each characteristic has a dedicated unit test file under `src/modules/characteristics/`:

- **Point-level**: density, dot count, edge counts (N/E/S/W), double edges, ink point count
- **Run-level**: longest horizontal/vertical run
- **Corner-level**: corner counts (4 orientations)
- **Fork-level**: fork counts (4 orientations)
- **Rectangle-level**: horizontal/vertical rectangle counts
- **Path topology**: Betti numbers (0, 1), free ends, tile crossing (count, cycles, component deltas)
- **Turn metrics**: inflection count, max monotonic turn length, tightest turn count, total turns, border touches
- **Compound predicates**: isArcade, isBars, isBoxes, isChain, isClosedLoop, isComb, isCross, isDots, isDoubleChain, isFork, isLines, isMesh, isParallel, isPureTree, isSingleArc, isSnake, isSwirl, isWaterfalls, isWhirl
- **Letter characteristics**: 50+ letter services across Latin, Arabic, Hebrew, Greek, Hangul, Hanzi, Katakana — each with 16 orientation evaluators per positional form

The `legacy-characteristics.ts` fixtures provide end-to-end regression for the full characteristic pipeline.

### Database Integration Tests (Testcontainers)

The CLI uses **Testcontainers** via `@codebase/persistence/testing` to spin up real Postgres 18 containers for integration tests. The key utility is `startDatabaseTestingModule()` from `projects/common/persistence/testing/persistence-testing.utilities.ts`:

```typescript
const database = await startDatabaseTestingModule({
  database: DatabaseModule,        // or omit for auto PostgresqlModule
  entities: [Meander],
  imports: [CharacteristicsModule, CodeModule, DrawingModule, ...],
  migrations: [Migration1791160950069, Migration1791414023001],
  project: "meanderaw",
  providers: [DrawCommand, DrawEnumerationService, ...],
  validate: (config) => environmentSchema.parse({ ...config, DRAW_EDGE_BUDGET: 12, DRAW_WORKERS: 0 }),
});
```

This:
1. Starts a throwaway Postgres container with project-specific role/database/schema
2. Runs the project's real migrations against it
3. Compiles a Nest testing module connected via `PostgresqlModule.forRoot`
4. Returns `{ close, container, dataSource, module, repository }`

The container uses the **official Postgres image** with custom initialization SQL that creates the same role, database, and schema as the local Docker setup (`projects/common/persistence/src/modules/postgresql/postgresql-container.utilities.ts`). The initialization runs as the container's superuser, then migrations run as the project's role.

#### Draw Command Integration Tests

Key integration test files:
- `src/modules/draw/draw.command.integration.test.ts` — `--code` mode against real DB
- `src/modules/draw/draw-enumeration.service.integration.test.ts` — lattice-first half (enumeration → render → measure → persist)
- `src/modules/draw/draw-index.service.integration.test.ts` — index building
- `src/modules/draw/draw-pool.service.integration.test.ts` — real worker threads vs in-process
- `src/modules/draw/draw-run.command.integration.test.ts` — **full draw run** (enumeration + historical corpus ingestion)
- `src/modules/draw/draw-run-collision.command.integration.test.ts` — collision when a hardcoded entry's address is already committed
- `src/modules/draw/draw-run-regeneration.command.integration.test.ts` — regeneration over an already-populated database

The full draw run test (`draw-run.command.integration.test.ts`) drives the **entire pipeline** against a real database:
- Generalized enumeration at `DRAW_TEST_EDGE_BUDGET = 12` (9 shapes, ~2,079 meanders)
- Historical corpus ingestion (~1,000 hardcoded entries)
- Both halves write through the same unique index on lattice address
- **Collision detection**: hardcoded entries ingested first; enumeration skips already-held Codes
- Mocks `node:fs/promises` to capture page writes in memory for assertion
- Timeout: 300 seconds (real work: tens of thousands of rows decoded, rendered, measured, indexed)

#### Draw Pool Service (Worker Thread) Integration Test

`draw-pool.service.integration.test.ts` drives the pool through **real worker threads**, each booting its own `DrawWorkerModule` from `src/worker.ts`, against the same pool drawing in-process. This proves the worker entry point boots, receives a batch, and posts back rows the main thread can write. It asserts that a threaded pool draws exactly the rows, in exactly the order, a pool with no workers draws.

#### Draw Run Budget

`projects/meanderaw/meanderaw-cli/testing/draw-run-budget.ts` pins test budgets:
- `DRAW_TEST_EDGE_BUDGET = 12` — below app default (24 = millions of rows); 12 walks every code path with ~30k rows
- `DRAW_TEST_WORKERS = 0` — in-process drawing; real threads tested separately in `draw-pool.service.integration.test.ts`

The budget lives in a file importing nothing so a suite can read it inside `vi.hoisted`, before any module whose `ConfigModule.forRoot` validates the environment at import time has loaded.

### Drawing & SVG Tests

- `src/modules/drawing/drawing.service.unit.test.ts` — SVG generation
- `src/modules/svg/svg.service.unit.test.ts` — low-level SVG utilities
- `testing/path-data.ts` — shared assertions for rendered path data (`retracesItself` detects duplicate ink from axis non-alternation)

### Code, Geometry, Symmetry Tests

- `src/modules/code/code.service.unit.test.ts` — Code parsing, tiling, symmetry
- `src/modules/geometry/geometry.service.unit.test.ts` — grid geometry, coordinate formatting
- `src/modules/symmetry/symmetry.service.unit.test.ts` — symmetry detection, canonicalization

---

## meanderaw-web Testing

### Web Testing Utilities

Located in `projects/meanderaw/meanderaw-web/testing/`:

| File | Purpose |
|------|---------|
| `setup.ts` | `@testing-library/react` cleanup after each test |
| `render-route.tsx` | Renders TanStack Start router at a path, running loaders/head |

`render-route.tsx` creates a memory history, updates the router, awaits `router.load()`, and renders `<RouterProvider>`. The real `__root` route renders `<html>` which can't mount in a test `<div>`, so it's mocked to a bare root route.

### Web Integration Test

`projects/meanderaw/meanderaw-web/src/routes/index.integration.test.tsx` demonstrates the pattern:

```tsx
import { renderRoute } from "../../testing/render-route";
import { Route } from "./index";

describe("index", () => {
  it("renders its page", async () => {
    await renderRoute("/");
    await expect(screen.findByRole("heading", { level: 1 })).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/");
  });
});
```

This tests:
- SSR route rendering with loader execution
- Head/meta tag injection
- Client-side hydration (jsdom)
- Accessibility role queries

### Testing Strategy

- **Server functions** (`*.functions.ts`) excluded from coverage — logic tested in `.utilities.ts`
- **Route components** tested via `renderRoute` at their path
- **Shared utilities** tested in CLI (characteristics, code, geometry) and imported by web
- **No database in web tests** — web reads from API; CLI owns persistence

---

## CI Test Sharding

The GitHub Actions workflow (`.github/workflows/continuous-integration.yml`) shards tests into four legs that together cover every project once, so none waits for a free `--parallel` slot behind the slow ones:

| Leg | Target | Exclude | Shard |
|-----|--------|---------|-------|
| Test | `test-code` | meanderaw-cli, caelundas, ic-suite | — |
| Test Caelundas | `test-code` | `*,!projects/caelundas/**` | caelundas |
| **Test Meanderaw** | `test-code` | `*,!meanderaw-cli` | **meanderaw-cli** |
| Test IC Suite | `test-code` | `*,!projects/ic-suite/**` | ic-suite |

Meanderaw runs alone because it took over seven minutes uncached beside the rest (about three minutes alone). Its suite is not a set of fast unit tests — the exhaustive enumeration at edge budget 12 with real Postgres containers produces tens of thousands of real documents, and that is the work happening, not a hang.

---

## Running Tests

```bash
# From repository root
pnpm test                          # All projects
pnpm --filter meanderaw-cli test   # CLI only
pnpm --filter meanderaw-web test   # Web only

# With coverage
pnpm --filter meanderaw-cli test --coverage
pnpm --filter meanderaw-web test --coverage
```

---

## Related Pages

- [Meanderaw Domain](../domain/meanderaw.md) — domain concepts and architecture
- [Integration Testing](../testing/integration.md) — cross-project integration patterns
- [Testing Overview](../testing/overview.md) — general testing principles
